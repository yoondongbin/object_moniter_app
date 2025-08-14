import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { objectService, type ObjectData } from '../services/api';
import styles from '../styles/ObjectListScreen.styles';
import { Colors } from '../styles/colors';

const ObjectListScreen = ({ navigation }: any) => {
  const [objects, setObjects] = useState<ObjectData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadObjects = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await objectService.getObjects();
      
      // API 서비스는 배열을 직접 반환하므로 그대로 사용
      setObjects(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('객체 목록 로드 실패:', error);
      Alert.alert('오류', '객체 목록을 불러오는데 실패했습니다.');
      setObjects([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 화면이 포커스될 때마다 객체 목록을 새로고침
  useFocusEffect(
    useCallback(() => {
      loadObjects();
    }, [loadObjects])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadObjects();
    setIsRefreshing(false);
  };

  const handleCreateObject = () => {
    navigation.navigate('CreateObject');
  };

  const handleEditObject = (object: ObjectData) => {
    navigation.navigate('EditObject', { object });
  };

  const handleDeleteObject = (object: ObjectData) => {
    Alert.alert(
      '객체 삭제',
      `"${object.name}" 객체를 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await objectService.deleteObject(object.id!);
              Alert.alert('성공', '객체가 삭제되었습니다.');
              loadObjects();
            } catch (error) {
              console.error('객체 삭제 실패:', error);
              Alert.alert('오류', '객체 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  const handleToggleStatus = async (object: ObjectData) => {
    try {
      const newStatus = object.status === 'active' ? 'inactive' : 'active';
      await objectService.updateObject(object.id!, { status: newStatus });
      Alert.alert('성공', `객체 상태가 ${newStatus === 'active' ? '활성화' : '비활성화'}되었습니다.`);
      loadObjects();
    } catch (error) {
      console.error('객체 상태 변경 실패:', error);
      Alert.alert('오류', '객체 상태 변경에 실패했습니다.');
    }
  };

  const renderObjectItem = ({ item }: { item: ObjectData }) => (
    <View style={styles.objectCard}>
      <View style={styles.objectHeader}>
        <Text style={styles.objectName}>{item.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'active' ? Colors.success : Colors.textLight }]}>
          <Text style={styles.statusText}>
            {item.status === 'active' ? '활성' : '비활성'}
          </Text>
        </View>
      </View>
      
      {item.description && (
        <Text style={styles.objectDescription}>{item.description}</Text>
      )}
      
      <View style={styles.objectInfo}>
        <Text style={styles.objectInfoText}>
          생성일: {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
        </Text>
        {(item as any).detection_count !== undefined && (
          <Text style={styles.objectInfoText}>
            탐지 횟수: {(item as any).detection_count}회
          </Text>
        )}
      </View>
      
      <View style={styles.objectActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditObject(item)}
        >
          <Text style={styles.actionButtonText}>수정</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: item.status === 'active' ? Colors.warning : Colors.success }]}
          onPress={() => handleToggleStatus(item)}
        >
          <Text style={styles.actionButtonText}>
            {item.status === 'active' ? '중지' : '시작'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteObject(item)}
        >
          <Text style={styles.actionButtonText}>삭제</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>모니터 목록을 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>모니터 관리</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleCreateObject}>
          <Text style={styles.addButtonText}>+ 새 모니터</Text>
        </TouchableOpacity>
      </View>

      {objects.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>등록된 모니터가 없습니다</Text>
          <Text style={styles.emptySubtitle}>새로운 모니터를 추가해보세요</Text>
          <TouchableOpacity style={styles.emptyAddButton} onPress={handleCreateObject}>
            <Text style={styles.emptyAddButtonText}>모니터 추가</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={objects}
          renderItem={renderObjectItem}
          keyExtractor={(item) => item.id?.toString() || item.name}
          contentContainerStyle={styles.listContainer}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default ObjectListScreen;