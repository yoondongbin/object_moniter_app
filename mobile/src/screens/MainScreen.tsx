import React from 'react'
import { ScrollView } from 'react-native'
import UploadSummary from '../components/UploadSummary'
import AlertSummary from '../components/AlertSummary'
import StatsOverview from '../components/StatsOverview'
import DectionList from '../components/DectionList'

const MainScreen = () => {
  return (
    <ScrollView>
      <UploadSummary />
      <AlertSummary />
      <StatsOverview />
      <DectionList />
    </ScrollView>
  )
}

export default MainScreen