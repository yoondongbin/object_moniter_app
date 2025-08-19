// 상수 정의
final String mobileDir = 'mobile'
final String backendImage = 'object-monitor-backend'
final String apkOutputDir = 'mobile/android/app/build/outputs/apk/release'
final String iosArtifactsDir = '/tmp/jenkins-ios-artifacts'

pipeline {
    agent any // Docker 컨테이너에서 실행

    options {
        timestamps()
        timeout(time: 120, unit: 'MINUTES') // iOS 빌드 시간 고려하여 증가
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    parameters {
        choice(
            name: 'APP_ENV',
            choices: ['staging', 'production'],
            description: '🌍 빌드할 환경을 선택하세요'
        )
        booleanParam(
            name: 'BUILD_BACKEND',
            defaultValue: true,
            description: '🐳 백엔드 Docker 이미지 빌드'
        )
        booleanParam(
            name: 'BUILD_ANDROID',
            defaultValue: true,
            description: '🤖 Android APK 빌드'
        )
        booleanParam(
            name: 'BUILD_IOS',
            defaultValue: true,
            description: '🍎 iOS 앱 빌드 (macOS 필요)'
        )
        booleanParam(
            name: 'DEPLOY_BACKEND',
            defaultValue: false,
            description: '🚀 백엔드 서버에 배포 (서버 준비되면 활성화)'
        )
        booleanParam(
            name: 'CLEAN_BUILD',
            defaultValue: false,
            description: '🧹 완전 클린 빌드 (캐시 정리)'
        )
    }

    environment {
        // Docker 이미지 이름 설정
        BACKEND_IMAGE = 'object-monitor-backend'
        BUILD_TIMESTAMP = "${new Date().format('yyyyMMdd-HHmmss')}"

        // 환경별 API URL 설정
        CURRENT_API_URL = "${params.APP_ENV == 'production' ?
            credentials('API_BASE_URL_PROD') :
            (params.APP_ENV == 'staging' ?
                credentials('API_BASE_URL_STAGING') :
                credentials('API_BASE_URL_DEV'))}"
    }

    stages {
        stage('🏁 시작 준비') {
            steps {
                echo '🚀 CI/CD 파이프라인 시작!'
                echo '📋 빌드 정보:'
                echo "   - 환경: ${params.APP_ENV}"
                echo "   - 백엔드 빌드: ${params.BUILD_BACKEND}"
                echo "   - Android 빌드: ${params.BUILD_ANDROID}"
                echo "   - iOS 빌드: ${params.BUILD_IOS}"
                echo "   - 백엔드 배포: ${params.DEPLOY_BACKEND}"
                echo "   - 클린 빌드: ${params.CLEAN_BUILD}"
                echo "   - 빌드 번호: ${BUILD_NUMBER}"
                echo "   - 타임스탬프: ${BUILD_TIMESTAMP}"

                // 작업 공간 정리
                script {
                    if (params.CLEAN_BUILD) {
                        echo '🧹 완전 클린 빌드 - 모든 캐시 정리 중...'
                        sh 'git clean -fdx || true'
                    } else {
                        echo '🔄 일반 빌드 - 기본 정리만 수행'
                        sh 'git clean -fd || true'
                    }
                }

                // 소스코드 체크아웃
                checkout scm

                // 빌드 환경 정보 출력
                sh '''
                    echo "🖥️ 빌드 환경 정보:"
                    echo "   - OS: $(uname -a)"
                    echo "   - Docker: $(docker --version || echo 'Docker 없음')"
                    echo "   - Node.js: $(node --version || echo 'Node.js 없음')"
                    echo "   - Java: $(java -version 2>&1 | head -1 || echo 'Java 없음')"
                '''
            }
        }

        stage('🐳 백엔드 Docker 빌드') {
            when {
                expression { return params.BUILD_BACKEND }
            }
            steps {
                echo '🐳 백엔드 Docker 이미지를 빌드하는 중...'

                script {
                    String imageTag = "${backendImage}:${params.APP_ENV}-${BUILD_NUMBER}"
                    String latestTag = "${backendImage}:${params.APP_ENV}-latest"

                    dir('back_end') {
                        // Docker 이미지 빌드
                        sh """
                            echo "📦 Docker 이미지 빌드 시작..."
                            echo "   - 이미지 태그: ${imageTag}"
                            echo "   - 최신 태그: ${latestTag}"

                            # Docker 빌드 컨텍스트 확인
                            echo "📂 빌드 컨텍스트 파일들:"
                            ls -la

                            # Docker 빌드 실행
                            docker build -t ${imageTag} .
                            docker tag ${imageTag} ${latestTag}

                            # 이미지 정보 확인
                            echo "📊 생성된 Docker 이미지:"
                            docker images | grep ${BACKEND_IMAGE} | head -5

                            # 이미지 크기 확인
                            IMAGE_SIZE=\$(docker images ${imageTag} --format "table {{.Size}}" | tail -1)
                            echo "📏 이미지 크기: \$IMAGE_SIZE"

                            echo "✅ Docker 이미지 빌드 완료!"
                        """

                        // Docker Registry 푸시 (선택적)
                        pushToDockerRegistry(imageTag, latestTag)
                    }
                }
            }
            post {
                success {
                    echo '✅ 백엔드 Docker 빌드 성공!'
                }
                failure {
                    echo '❌ 백엔드 Docker 빌드 실패!'
                    // Docker 빌드 로그 저장
                    sh 'docker system df || true'
                }
            }
        }

        stage('📱 모바일 의존성 설치') {
            when {
                anyOf {
                    expression { return params.BUILD_ANDROID }
                    expression { return params.BUILD_IOS }
                }
            }
            steps {
                echo '📦 모바일 의존성을 설치하는 중...'
                dir('mobile') {
                    sh '''
                        echo "📍 현재 위치: $(pwd)"
                        echo "🔧 개발 도구 버전:"
                        echo "   - Node.js: $(node --version)"
                        echo "   - npm: $(npm --version)"
                        echo "   - Yarn: $(yarn --version)"

                        # 기존 node_modules 정리 (클린 빌드 시)
                        if [ "${CLEAN_BUILD}" = "true" ]; then
                            echo "🧹 기존 의존성 정리 중..."
                            rm -rf node_modules
                            yarn cache clean || true
                        fi

                        # package.json 확인
                        echo "📄 package.json 확인:"
                        if [ -f "package.json" ]; then
                            echo "   ✅ package.json 존재"
                        else
                            echo "   ❌ package.json 없음!"
                            exit 1
                        fi

                        # 의존성 설치
                        echo "📦 의존성 설치 시작..."
                        yarn install --frozen-lockfile --network-timeout 300000 --verbose

                        # 설치 결과 확인
                        echo "📊 설치된 패키지 정보:"
                        yarn list --depth=0 | head -10

                        echo "✅ 의존성 설치 완료!"
                    '''
                }
            }
            post {
                failure {
                    echo '❌ 모바일 의존성 설치 실패!'
                    // 의존성 설치 로그 저장
                    archiveArtifacts artifacts: 'mobile/yarn-error.log', allowEmptyArchive: true
                }
            }
        }

        stage('⚙️ 모바일 환경 설정') {
            when {
                anyOf {
                    expression { return params.BUILD_ANDROID }
                    expression { return params.BUILD_IOS }
                }
            }
            steps {
                echo '⚙️ 모바일 환경 설정 파일을 생성하는 중...'
                withCredentials([
                    string(credentialsId: 'TIMEOUT', variable: 'TIMEOUT')
                ]) {
                    dir(mobileDir) {
                        sh """
                            echo "🔧 환경 설정 파일 생성..."
                            echo "   - 환경: ${params.APP_ENV}"
                            echo "   - API URL: \${CURRENT_API_URL}"
                            echo "   - 타임아웃: \${TIMEOUT:-15000}ms"

                            # CI/CD용 환경 설정 스크립트 실행
                            if [ -f "scripts/ci-make-env.sh" ]; then
                                echo "📜 CI 환경 설정 스크립트 실행..."
                                chmod +x scripts/ci-make-env.sh

                                # 환경 변수 설정하여 스크립트 실행
                                APP_ENV=${params.APP_ENV} \\
                                API_BASE_URL=\${CURRENT_API_URL} \\
                                TIMEOUT=\${TIMEOUT:-15000} \\
                                BUILD_NUMBER=${BUILD_NUMBER} \\
                                ./scripts/ci-make-env.sh
                            else
                                echo "⚠️ CI 환경 설정 스크립트가 없습니다. 수동으로 생성..."

                                # .env 파일 수동 생성
                                cat > .env.${params.APP_ENV} << 'ENVEOF'
APP_ENV=${params.APP_ENV}
API_BASE_URL=\${CURRENT_API_URL}
TIMEOUT=\${TIMEOUT:-15000}
ENABLE_FLIPPER=false
DEBUG_MODE=false
LOG_LEVEL=info
BUILD_NUMBER=${BUILD_NUMBER}
BUILD_TIMESTAMP=${BUILD_TIMESTAMP}
ENVEOF

                                # 현재 사용할 .env 파일로 복사
                                cp .env.${params.APP_ENV} .env
                            fi

                            echo "✅ 환경 설정 완료!"
                            echo "📄 생성된 환경 설정:"
                            cat .env | sed 's/\\(.*PASSWORD.*=\\).*/\\1***/' | sed 's/\\(.*SECRET.*=\\).*/\\1***/'
                        """
                    }
                }
            }
        }

        stage('🤖 Android 릴리스 빌드') {
            when {
                expression { return params.BUILD_ANDROID }
            }
            steps {
                echo '🤖 Android 릴리스 APK를 빌드하는 중...'
                withCredentials([
                    file(credentialsId: 'android_keystore', variable: 'KEYSTORE_FILE'),
                    string(credentialsId: 'ANDROID_KEYSTORE_PASSWORD', variable: 'STORE_PWD'),
                    string(credentialsId: 'ANDROID_KEY_ALIAS', variable: 'KEY_ALIAS'),
                    string(credentialsId: 'ANDROID_KEY_PASSWORD', variable: 'KEY_PWD')
                ]) {
                    dir(mobileDir) {
                        sh """
                            echo "🔨 Android 빌드 시작..."
                            cd android

                            # Android 빌드 환경 확인
                            echo "🔍 Android 빌드 환경 확인:"
                            ANDROID_SDK_ROOT=\${ANDROID_SDK_ROOT:-\$ANDROID_HOME}
                            echo "   - Android SDK: \$ANDROID_SDK_ROOT"
                            echo "   - Java Home: \$JAVA_HOME"

                            if [ -z "\$ANDROID_SDK_ROOT" ]; then
                                echo "❌ ANDROID_SDK_ROOT 또는 ANDROID_HOME이 설정되지 않았습니다!"
                                echo "💡 해결방법: Android SDK를 설치하고 환경변수를 설정하세요"
                                exit 1
                            fi

                            # SDK 도구 확인
                            echo "🛠️ Android SDK 도구 확인:"
                            echo "   - adb: \$(which adb || echo '없음')"
                            echo "   - aapt: \$(find \$ANDROID_SDK_ROOT -name aapt | head -1 || echo '없음')"

                            # local.properties 파일 생성
                            echo "📝 local.properties 생성..."
                            cat > local.properties << 'PROPEOF'
sdk.dir=\$ANDROID_SDK_ROOT
MYAPP_UPLOAD_STORE_PASSWORD=\${STORE_PWD}
MYAPP_UPLOAD_KEY_PASSWORD=\${KEY_PWD}
MYAPP_UPLOAD_KEY_ALIAS=\${KEY_ALIAS}
MYAPP_UPLOAD_STORE_FILE=my-upload-key.keystore
PROPEOF

                            # 키스토어 파일 복사 및 권한 설정
                            echo "🔑 키스토어 파일 설정..."
                            cp "\$KEYSTORE_FILE" app/my-upload-key.keystore
                            chmod 644 app/my-upload-key.keystore
                            echo "   ✅ 키스토어 파일 복사 완료"

                            # Gradle 권한 확인 및 설정
                            chmod +x gradlew

                            # Gradle 빌드 실행
                            echo "🏗️ Gradle 빌드 실행..."
                            echo "   - 환경: ${params.APP_ENV}"
                            echo "   - 빌드 타입: Release"

                            # 클린 빌드
                            ./gradlew clean --no-daemon --stacktrace

                            # 릴리스 빌드
                            ./gradlew assembleRelease --no-daemon --stacktrace --info

                            # 빌드 결과 확인
                            APK_PATH="app/build/outputs/apk/release/app-release.apk"
                            if [ -f "\$APK_PATH" ]; then
                                echo "✅ Android APK 빌드 성공!"
                                echo "📱 APK 정보:"
                                ls -lh "\$APK_PATH"

                                # APK 크기 확인
                                APK_SIZE=\$(ls -lh "\$APK_PATH" | awk '{print \$5}')
                                echo "   - 크기: \$APK_SIZE"

                                # APK 파일명에 환경과 빌드번호 추가
                                NEW_APK_NAME="app-${params.APP_ENV}-${BUILD_NUMBER}.apk"
                                cp "\$APK_PATH" "app/build/outputs/apk/release/\$NEW_APK_NAME"
                                echo "📦 APK 파일명 변경: \$NEW_APK_NAME"

                                # APK 정보 추출
                                echo "📊 APK 상세 정보:"
                                \$ANDROID_SDK_ROOT/build-tools/*/aapt dump badging "\$APK_PATH" | head -5 || true
                            else
                                echo "❌ Android APK 빌드 실패!"
                                echo "📂 빌드 출력 디렉터리 확인:"
                                find app/build -name "*.apk" -type f || true
                                echo "📋 Gradle 태스크 확인:"
                                ./gradlew tasks --group="build" || true
                                exit 1
                            fi
                        """
                    }
                }
            }
            post {
                success {
                    echo '📱 Android APK를 아티팩트로 저장하는 중...'
                    archiveArtifacts artifacts: "${apkOutputDir}/*.apk", fingerprint: true

                    // APK 파일 정보를 빌드 설명에 추가
                    script {
                        String apkPath = "${apkOutputDir}/app-release.apk"
                        if (fileExists(apkPath)) {
                            String apkSize = sh(
                                script: "ls -lh ${apkPath} | awk '{print \$5}'",
                                returnStdout: true
                            ).trim()
                            currentBuild.description = "Android APK: ${apkSize}"
                        }
                    }
                }
                failure {
                    echo '❌ Android 빌드가 실패했습니다.'
                    // 빌드 로그 저장
                    archiveArtifacts artifacts: 'mobile/android/app/build/reports/**/*', allowEmptyArchive: true
                    archiveArtifacts artifacts: 'mobile/android/app/build/outputs/logs/**/*', allowEmptyArchive: true
                }
                always {
                    // 보안을 위해 키스토어 파일 및 설정 파일 삭제
                    sh '''
                        rm -f mobile/android/app/my-upload-key.keystore || true
                        rm -f mobile/android/local.properties || true
                        echo "🔒 보안 파일 정리 완료"
                    '''
                }
            }
        }

        stage('🍎 iOS 릴리스 빌드') {
            when {
                expression { return params.BUILD_IOS }
            }
            steps {
                echo '🍎 iOS 릴리스 앱을 빌드하는 중...'

                script {
                    // iOS 빌드는 macOS에서만 가능하므로 빌드 요청 파일 생성
                    echo '📝 iOS 빌드 요청 파일 생성 중...'

                    dir('mobile') {
                        // 빌드 요청 JSON 파일 생성
                        String buildRequestFile = "/tmp/jenkins-ios-builds/build-request-${BUILD_NUMBER}.json"

                        sh """
                            # iOS 빌드 요청 디렉터리 생성
                            mkdir -p /tmp/jenkins-ios-builds

                            # 빌드 요청 JSON 파일 생성
                            cat > ${buildRequestFile} << 'REQUESTEOF'
{
    "buildNumber": "${BUILD_NUMBER}",
    "environment": "${params.APP_ENV}",
    "status": "requested",
    "timestamp": "\$(date -Iseconds)",
    "jenkinsUrl": "${JENKINS_URL}",
    "jobName": "${JOB_NAME}",
    "buildUrl": "${BUILD_URL}",
    "requestedBy": "jenkins-pipeline",
    "apiBaseUrl": "\${CURRENT_API_URL}",
    "timeout": "15000"
}
REQUESTEOF

                            echo "📤 iOS 빌드 요청 파일 생성 완료: ${buildRequestFile}"
                            echo "📄 요청 파일 내용:"
                            cat ${buildRequestFile}
                        """

                        // iOS 빌드 완료 대기
                        echo '⏳ iOS 빌드 완료 대기 중...'

                        timeout(time: 30, unit: 'MINUTES') {
                            waitUntil {
                                script {
                                    // 빌드 상태 파일 확인
                                    String statusFile = "/tmp/jenkins-ios-builds/build-status-${BUILD_NUMBER}.json"

                                    if (fileExists(statusFile)) {
                                        String status = sh(
                                            script: "grep '\"status\"' ${statusFile} | cut -d'\"' -f4 || echo 'unknown'",
                                            returnStdout: true
                                        ).trim()

                                        echo "📊 iOS 빌드 상태: ${status}"

                                        if (status == 'completed') {
                                            echo '✅ iOS 빌드 완료!'
                                            return true
                                        } else if (status == 'failed') {
                                            echo '❌ iOS 빌드 실패!'
                                            error('iOS 빌드가 실패했습니다.')
                                        }
                                    } else {
                                        echo '⏳ iOS 빌드 진행 중... (상태 파일 대기)'
                                    }

                                    // 30초 대기 후 다시 확인
                                    sleep(30)
                                    return false
                                }
                            }
                        }

                        // 빌드 결과 아티팩트 복사
                        echo '📦 iOS 빌드 아티팩트 복사 중...'
                        sh """
                            # iOS 아티팩트 디렉터리 확인
                            if [ -d "${iosArtifactsDir}" ]; then
                                echo "📂 iOS 아티팩트 디렉터리 내용:"
                                ls -la ${iosArtifactsDir}/

                                # 해당 빌드의 아티팩트 찾기
                                IOS_ARTIFACT=\$(find ${iosArtifactsDir} -name "*${params.APP_ENV}-${BUILD_NUMBER}.app.zip" | head -1)

                                if [ -n "\$IOS_ARTIFACT" ] && [ -f "\$IOS_ARTIFACT" ]; then
                                    echo "✅ iOS 아티팩트 발견: \$IOS_ARTIFACT"

                                    # 아티팩트를 Jenkins 작업 공간으로 복사
                                    mkdir -p ios/build/Build/Products/Release-iphonesimulator
                                    cp "\$IOS_ARTIFACT" ios/build/Build/Products/Release-iphonesimulator/

                                    # 파일 크기 확인
                                    IOS_SIZE=\$(du -sh "\$IOS_ARTIFACT" | awk '{print \$1}')
                                    echo "📏 iOS 앱 크기: \$IOS_SIZE"
                                else
                                    echo "❌ iOS 아티팩트를 찾을 수 없습니다!"
                                    exit 1
                                fi
                            else
                                echo "❌ iOS 아티팩트 디렉터리가 없습니다: ${iosArtifactsDir}"
                                exit 1
                            fi
                        """
                    }
                }
            }
            post {
                success {
                    echo '📱 iOS 앱을 아티팩트로 저장하는 중...'
                    archiveArtifacts(
                        artifacts: 'mobile/ios/build/Build/Products/Release-iphonesimulator/*.zip',
                        fingerprint: true,
                        allowEmptyArchive: true
                    )

                    // 앱 크기 정보를 빌드 설명에 추가
                    script {
                        String iosZipPath = "mobile/ios/build/Build/Products/Release-iphonesimulator/mobile-${params.APP_ENV}-${BUILD_NUMBER}.app.zip"
                        if (fileExists(iosZipPath)) {
                            String appSize = sh(
                                script: "du -sh ${iosZipPath} | awk '{print \$1}'",
                                returnStdout: true
                            ).trim()
                            if (currentBuild.description) {
                                currentBuild.description += ", iOS App: ${appSize}"
                            } else {
                                currentBuild.description = "iOS App: ${appSize}"
                            }
                        }
                    }
                }
                failure {
                    echo '❌ iOS 빌드가 실패했습니다.'

                    // iOS 빌드 로그 수집 시도
                    sh '''
                        echo "📋 iOS 빌드 실패 정보 수집 중..."

                        # 빌드 상태 파일 확인
                        STATUS_FILE="/tmp/jenkins-ios-builds/build-status-${BUILD_NUMBER}.json"
                        if [ -f "$STATUS_FILE" ]; then
                            echo "📄 빌드 상태 파일 내용:"
                            cat "$STATUS_FILE"
                        fi

                        # macOS 빌드 머신 연결 상태 확인
                        echo "🖥️ macOS 빌드 환경 확인:"
                        echo "   - 빌드 요청 디렉터리: $(ls -la /tmp/jenkins-ios-builds/ 2>/dev/null || echo '디렉터리 없음')"
                        echo "   - 아티팩트 디렉터리: $(ls -la ${iosArtifactsDir}/ 2>/dev/null || echo '디렉터리 없음')"
                    '''
                }
                always {
                    // iOS 빌드 관련 임시 파일 정리
                    sh '''
                        echo "🧹 iOS 빌드 임시 파일 정리..."
                        rm -f /tmp/jenkins-ios-builds/build-request-${BUILD_NUMBER}.json || true
                        rm -f /tmp/jenkins-ios-builds/build-status-${BUILD_NUMBER}.json || true
                    '''
                }
            }
        }

        stage('🚀 백엔드 배포') {
            when {
                allOf {
                    expression { return params.DEPLOY_BACKEND }
                    expression { return params.BUILD_BACKEND }
                }
            }
            steps {
                echo '🚀 백엔드를 서버에 배포하는 중...'

                // 백엔드 서버 배포
                deployToBackendServer()
            }
            post {
                success {
                    echo '✅ 백엔드 배포 성공!'
                }
                failure {
                    echo '❌ 백엔드 배포 실패!'
                }
            }
        }
    }

    post {
        always {
            echo '🧹 빌드 후 정리 작업...'

            // 임시 파일들 정리
            sh '''
                echo "🗑️ 임시 파일 정리 중..."

                # Docker 정리 (오래된 이미지 삭제)
                docker image prune -f || true

                # 빌드 캐시 정리 (클린 빌드가 아닌 경우에만 일부 보존)
                if [ "${CLEAN_BUILD}" = "true" ]; then
                    echo "🧹 완전 정리 모드"
                    rm -rf mobile/node_modules/.cache || true
                    rm -rf mobile/ios/build || true
                    rm -rf mobile/android/.gradle || true
                    rm -rf mobile/android/app/build || true
                else
                    echo "🔄 부분 정리 모드"
                    rm -rf mobile/android/app/build/intermediates || true
                    rm -rf mobile/ios/build/Logs || true
                fi

                # 환경 파일 정리
                rm -f mobile/.env mobile/.env.* || true

                echo "✅ 정리 작업 완료"
            '''

            // 빌드 결과 요약
            script {
                def summary = '🎯 빌드 완료 요약:\n'
                summary += "    - 환경: ${params.APP_ENV}\n"
                summary += "    - 빌드 번호: ${BUILD_NUMBER}\n"
                summary += "    - 소요 시간: ${currentBuild.durationString}\n"
                summary += "    - 빌드 타입: ${params.CLEAN_BUILD ? '완전 클린 빌드' : '일반 빌드'}\n"

                if (params.BUILD_BACKEND) {
                    summary += '    - 백엔드: ✅ Docker 이미지 생성\n'
                }
                if (params.BUILD_ANDROID) {
                    summary += '    - 안드로이드: ✅ APK 생성\n'
                }
                if (params.BUILD_IOS) {
                    summary += '    - iOS: ✅ 앱 생성 (macOS 빌드)\n'
                }
                if (params.DEPLOY_BACKEND) {
                    summary += '    - 배포: ✅ 서버 배포 완료\n'
                }

                echo summary

                // 빌드 설명 업데이트
                if (!currentBuild.description) {
                    currentBuild.description = "빌드 #${BUILD_NUMBER} (${params.APP_ENV})"
                }
            }
        }

        success {
            echo '🎉 모든 빌드가 성공적으로 완료되었습니다.'

            // 성공 시 추가 정보 출력
            script {
                echo '📊 빌드 성공 상세 정보:'
                if (params.BUILD_ANDROID) {
                    echo '   📱 Android APK: Jenkins 아티팩트에서 다운로드 가능'
                }
                if (params.BUILD_IOS) {
                    echo '   🍎 iOS App: Jenkins 아티팩트에서 다운로드 가능'
                }
                if (params.BUILD_BACKEND) {
                    echo '   🐳 Docker 이미지: 로컬 레지스트리에 저장됨'
                }
                echo '   🔗 아티팩트 다운로드: ' + BUILD_URL + 'artifact/'
            }
        }
        failure {
            echo '❌ 빌드 중 오류가 발생했습니다.'

            // 실패 시 디버깅 정보 출력
            script {
                echo '🔍 빌드 실패 디버깅 정보:'
                echo '   📋 실패한 스테이지를 확인하세요'
                echo '   📊 시스템 리소스 확인:'
                sh '''
                    echo "   - 디스크 사용량: $(df -h / | tail -1 | awk '{print $5}')"
                    echo "   - 메모리 사용량: $(free -h | grep Mem | awk '{print $3"/"$2}')"
                    echo "   - Docker 상태: $(docker system df 2>/dev/null || echo 'Docker 정보 없음')"
                '''
            }
        }
        unstable {
            echo '⚠️ 빌드가 불안정합니다.'
        }
    }
}

// 헬퍼 함수들
void pushToDockerRegistry(String imageTag, String latestTag) {
    script {
        if (env.DOCKER_REGISTRY && env.DOCKER_REGISTRY != '') {
            withCredentials([
                usernamePassword(
                    credentialsId: 'docker_registry_credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )
            ]) {
                sh """
                    echo "🔐 Docker Registry 로그인..."
                    echo "\$DOCKER_PASS" | docker login -u "\$DOCKER_USER" --password-stdin \${DOCKER_REGISTRY}

                    echo "📤 Docker 이미지 푸시..."
                    docker tag ${imageTag} \${DOCKER_REGISTRY}/${imageTag}
                    docker tag ${latestTag} \${DOCKER_REGISTRY}/${latestTag}
                    docker push \${DOCKER_REGISTRY}/${imageTag}
                    docker push \${DOCKER_REGISTRY}/${latestTag}

                    echo "✅ Docker 이미지 푸시 완료!"
                """
            }
        } else {
            echo 'ℹ️ Docker Registry가 설정되지 않아 로컬에만 저장됩니다.'
            echo '💡 Docker Registry 설정 방법:'
            echo '   1. Jenkins에서 DOCKER_REGISTRY 환경변수 설정'
            echo '   2. docker_registry_credentials 인증정보 추가'
        }
    }
}

void deployToBackendServer() {
    script {
        if (env.BACKEND_SERVER_HOST && env.BACKEND_SERVER_HOST != '') {
            withCredentials([
                string(credentialsId: 'BACKEND_SERVER_HOST', variable: 'SERVER_HOST'),
                sshUserPrivateKey(
                    credentialsId: 'backend_server_ssh',
                    keyFileVariable: 'SSH_KEY',
                    usernameVariable: 'SSH_USER'
                )
            ]) {
                sh """
                    echo "🔐 서버 연결 중: \$SSH_USER@\$SERVER_HOST"

                    # SSH 연결 테스트
                    ssh -i "\$SSH_KEY" -o StrictHostKeyChecking=no -o ConnectTimeout=10 "\$SSH_USER@\$SERVER_HOST" 'echo "SSH 연결 성공"'

                    # SSH로 연결 테스트
                    ssh -i "\$SSH_KEY" -o StrictHostKeyChecking=no "\$SSH_USER@\$SERVER_HOST" << 'DEPLOYEOF'
                    echo "📁 베포 디렉터리로 이동..."
                    cd /opt/object-monitor || { echo "❌ 베포 디렉터리가 없습니다!"; exit 1; }

                    echo "🐳 Docker 이미지 업데이트..."
                    export APP_ENV=${params.APP_ENV}
                    export IMAGE_TAG=${backendImage}:${params.APP_ENV}-latest

                    # Docker Compose 파일 확인
                    if [ ! -f "docker-compose.yml" ]; then
                        echo "❌ docker-compose.yml 파일이 없습니다!"
                        exit 1
                    fi

                    # Docker Compose로 서비스 업데이트
                    echo "📥 Docker 이미지 풀링..."
                    docker-compose pull backend || echo "⚠️ 이미지 풀링 실패 (로컬 이미지 사용)"

                    echo "🚀 서비스 시작..."
                    docker-compose up -d backend

                    echo "⏳ 서비스 시작 대기..."
                    sleep 20

                    echo " 🏥 헬스체크 수행..."
                    for i in {1..5}; do
                        if curl -f http://localhost:5010/api/health; then
                            echo "✅ 헬스체크 성공!"
                            break
                        else
                            if [ \$i -eq 5 ]; then
                                echo "❌ 헬스체크 실패!"
                                echo "📋 컨테이너 로그:"
                                docker-compose logs --tail=50 backend
                                exit 1
                            fi
                            echo "⏳ 헬스체크 재시도 (\$i/5)"
                            sleep 10
                        fi
                        done

                        echo "✅ 백엔드 베포 완료!"
                        echo "📊 베포 정보:"
                        echo "  - 환경: ${params.APP_ENV}"
                        echo "  - 이미지: \$IMAGE_TAG"
                        echo "  - 베포 시간: \$(date)"

DEPLOYEOF
                    """
            }
        }else {
            echo 'ℹ️ 백엔드 서버가 설정되지 않아 배포를 건너뜁니다.'
            echo '💡 백엔드 서버 설정 방법:'
            echo '   1. Jenkins에서 BACKEND_SERVER_HOST 환경변수 설정'
            echo '   2. backend_server_ssh SSH 키 인증정보 추가'
            echo '   3. 서버에 Docker 및 Docker Compose 설치'
            echo '   4. 배포 디렉터리(/opt/object-monitor) 준비'
        }
    }
}
