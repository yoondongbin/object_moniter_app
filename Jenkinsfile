// 상수 정의
final String mobileDir = 'mobile'
final String backendImage = 'object-monitor-backend'
final String apkOutputDir = 'mobile/android/app/build/outputs/apk/release'
final String iosBuildDir = 'mobile/ios/build/Build/Products/Release-iphonesimulator'

pipeline {
    agent { label 'mac' } // iOS 빌드를 위해 맥 에이전트 필요

    options {
        timestamps()
        timeout(time: 90, unit: 'MINUTES')
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
            description: '🍎 iOS 앱 빌드 (시뮬레이터용)'
        )
        booleanParam(
            name: 'DEPLOY_BACKEND',
            defaultValue: false,
            description: '🚀 백엔드 서버에 배포 (서버 준비되면 활성화)'
        )
    }

    environment {
        // Docker 이미지 이름 설정
        BACKEND_IMAGE = 'object-monitor-backend'
        BUILD_TIMESTAMP = "${new Date().format('yyyyMMdd-HHmmss')}"
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
                echo "   - 빌드 번호: ${BUILD_NUMBER}"
                echo "   - 타임스탬프: ${BUILD_TIMESTAMP}"

                // 작업 공간 정리
                sh 'git clean -fdx || true'

                // 소스코드 체크아웃
                checkout scm
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

                            # Docker 빌드
                            docker build -t ${imageTag} .
                            docker build -t ${latestTag} .

                            # 이미지 정보 확인
                            docker images | grep ${BACKEND_IMAGE}

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
                        echo "현재 위치: $(pwd)"
                        echo "Node.js 버전: $(node --version)"
                        echo "Yarn 버전: $(yarn --version)"

                        # 캐시 정리
                        yarn cache clean || true

                        # 의존성 설치
                        yarn install --frozen-lockfile --network-timeout 300000

                        echo "✅ 의존성 설치 완료!"
                    '''
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
                    string(credentialsId: 'API_BASE_URL', variable: 'API_BASE_URL'),
                    string(credentialsId: 'TIMEOUT', variable: 'TIMEOUT')
                ]) {
                    dir(mobileDir) {
                                            sh """
                        echo "🔧 환경 설정 파일 생성..."
                        echo "   - 환경: ${params.APP_ENV}"
                        echo "   - API URL: \${API_BASE_URL}"
                        echo "   - 타임아웃: \${TIMEOUT:-15000}ms"

                        # .env 파일 생성
                        cat > .env.${params.APP_ENV} << 'ENVEOF'
APP_ENV=${params.APP_ENV}
API_BASE_URL=\${API_BASE_URL}
TIMEOUT=\${TIMEOUT:-15000}
ENABLE_FLIPPER=false
DEBUG_MODE=false
LOG_LEVEL=info
ENVEOF

                        # 현재 사용할 .env 파일로 복사
                        cp .env.${params.APP_ENV} .env

                        echo "✅ 환경 설정 완료!"
                        echo "📄 생성된 파일 내용:"
                        cat .env
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

                            # Android SDK 경로 확인
                            ANDROID_SDK_ROOT=\${ANDROID_SDK_ROOT:-\$ANDROID_HOME}
                            echo "📱 Android SDK 경로: \$ANDROID_SDK_ROOT"

                            if [ -z "\$ANDROID_SDK_ROOT" ]; then
                                echo "❌ ANDROID_SDK_ROOT 또는 ANDROID_HOME이 설정되지 않았습니다!"
                                exit 1
                            fi

                            # local.properties 파일 생성
                            cat > local.properties << 'PROPEOF'
sdk.dir=\$ANDROID_SDK_ROOT
MYAPP_UPLOAD_STORE_PASSWORD=\${STORE_PWD}
MYAPP_UPLOAD_KEY_PASSWORD=\${KEY_PWD}
PROPEOF

                            # 키스토어 파일 복사
                            cp "\$KEYSTORE_FILE" app/my-upload-key.keystore
                            echo "🔑 키스토어 파일 복사 완료"

                            # Gradle 권한 확인
                            chmod +x gradlew

                            # Gradle 빌드 실행
                            echo "🏗️ Gradle 빌드 실행..."
                            ./gradlew clean --no-daemon
                            ./gradlew assembleRelease --no-daemon --stacktrace --info

                            # 빌드 결과 확인
                            APK_PATH="app/build/outputs/apk/release/app-release.apk"
                            if [ -f "\$APK_PATH" ]; then
                                echo "✅ Android APK 빌드 성공!"
                                echo "📱 APK 정보:"
                                ls -lh "\$APK_PATH"

                                # APK 파일명에 환경과 빌드번호 추가
                                NEW_APK_NAME="app-${params.APP_ENV}-${BUILD_NUMBER}.apk"
                                cp "\$APK_PATH" "app/build/outputs/apk/release/\$NEW_APK_NAME"
                                echo "📦 APK 파일명 변경: \$NEW_APK_NAME"
                            else
                                echo "❌ Android APK 빌드 실패!"
                                echo "📂 빌드 출력 디렉터리 확인:"
                                find app/build -name "*.apk" -type f || true
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
                        String apkSize = sh(
                            script: "ls -lh ${apkPath} | awk '{print \$5}'",
                            returnStdout: true
                        ).trim()
                        currentBuild.description = "Android APK: ${apkSize}"
                    }
                }
                failure {
                    echo '❌ Android 빌드가 실패했습니다.'
                    // 빌드 로그 저장
                    archiveArtifacts artifacts: 'mobile/android/app/build/reports/**/*', allowEmptyArchive: true
                }
                always {
                    // 보안을 위해 키스토어 파일 삭제
                    sh 'rm -f mobile/android/app/my-upload-key.keystore || true'
                    sh 'rm -f mobile/android/local.properties || true'
                }
            }
        }

        stage('🍎 iOS 릴리스 빌드') {
            when {
                expression { return params.BUILD_IOS }
            }
            steps {
                echo '🍎 iOS 릴리스 앱을 빌드하는 중...'
                dir('mobile') {
                    sh """
                        echo "🔨 iOS 빌드 시작..."

                        # Xcode 버전 확인
                        xcodebuild -version || true

                        # CocoaPods 설치
                        echo "📦 CocoaPods 설치 중..."
                        npx pod-install ios

                        # iOS 시뮬레이터 목록 확인
                        echo "📱 사용 가능한 시뮬레이터:"
                        xcrun simctl list devices available | grep iPhone | head -5 || true

                        # Xcode 빌드 (시뮬레이터용)
                        echo "🏗️ Xcode 빌드 실행 중..."
                        xcodebuild -workspace ios/mobile.xcworkspace \\
                            -scheme mobile \\
                            -configuration Release \\
                            -sdk iphonesimulator \\
                            -derivedDataPath ios/build \\
                            -destination 'platform=iOS Simulator,name=iPhone 16 Pro' \\
                            clean build | xcpretty || true

                        # 빌드 결과 확인
                        APP_PATH="ios/build/Build/Products/Release-iphonesimulator/mobile.app"
                        if [ -d "\$APP_PATH" ]; then
                            echo "✅ iOS 앱 빌드 성공!"
                            echo "📱 앱 정보:"
                            ls -la "\$APP_PATH"

                            # 앱 크기 확인
                            du -sh "\$APP_PATH"

                            # 앱 번들에 환경 정보 추가 (압축)
                            cd ios/build/Build/Products/Release-iphonesimulator
                            zip -r "mobile-${params.APP_ENV}-${BUILD_NUMBER}.app.zip" mobile.app
                            echo "📦 앱 압축 완료: mobile-${params.APP_ENV}-${BUILD_NUMBER}.app.zip"
                        else
                            echo "❌ iOS 앱 빌드 실패!"
                            echo "📂 빌드 출력 디렉터리 확인:"
                            find ios/build -name "*.app" -type d || true
                            exit 1
                        fi
                    """
                }
            }
            post {
                success {
                    echo '📱 iOS 앱을 아티팩트로 저장하는 중...'
                    archiveArtifacts(
                        artifacts: "${iosBuildDir}/*.zip", 
                        fingerprint: true
                    )

                    // 앱 크기 정보를 빌드 설명에 추가
                    script {
                        String appPath = "${iosBuildDir}/mobile.app"
                        String appSize = sh(
                            script: "du -sh ${appPath} | awk '{print \$1}'",
                            returnStdout: true
                        ).trim()
                        if (currentBuild.description) {
                            currentBuild.description += ", iOS App: ${appSize}"
                        } else {
                            currentBuild.description = "iOS App: ${appSize}"
                        }
                    }
                }
                failure {
                    echo '❌ iOS 빌드가 실패했습니다.'
                    // 빌드 로그 저장
                    archiveArtifacts artifacts: 'mobile/ios/build/Logs/**/*', allowEmptyArchive: true
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
                # Docker 정리 (오래된 이미지 삭제)
                docker image prune -f || true

                # 빌드 캐시 정리
                rm -rf mobile/node_modules/.cache || true
                rm -rf mobile/ios/build || true
                rm -rf mobile/android/.gradle || true
                rm -rf mobile/android/app/build || true
            '''

            // 빌드 결과 요약
            script {
                def summary = '🎯 빌드 완료 요약:\n'
                summary += "   - 환경: ${params.APP_ENV}\n"
                summary += "   - 빌드 번호: ${BUILD_NUMBER}\n"
                summary += "   - 소요 시간: ${currentBuild.durationString}\n"

                if (params.BUILD_BACKEND) {
                    summary += '   - 백엔드: ✅ Docker 이미지 생성\n'
                }
                if (params.BUILD_ANDROID) {
                    summary += '   - Android: ✅ APK 생성\n'
                }
                if (params.BUILD_IOS) {
                    summary += '   - iOS: ✅ 앱 생성\n'
                }
                if (params.DEPLOY_BACKEND) {
                    summary += '   - 배포: ✅ 서버 배포 완료\n'
                }

                echo summary
            }
        }
        success {
            echo '🎉 모든 빌드가 성공적으로 완료되었습니다!'


        }
        failure {
            echo '❌ 빌드 중 오류가 발생했습니다.'


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
                    echo "\$DOCKER_PASS" | docker login -u "\$DOCKER_USER" --password-stdin

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

                    # SSH로 서버에 접속하여 배포
                    ssh -i "\$SSH_KEY" -o StrictHostKeyChecking=no "\$SSH_USER@\$SERVER_HOST" << 'DEPLOYEOF'
                        echo "📂 배포 디렉터리로 이동..."
                        cd /opt/object-monitor || { echo "배포 디렉터리가 없습니다!"; exit 1; }

                        echo "🐳 Docker 이미지 업데이트..."
                        export APP_ENV=${params.APP_ENV}
                        export IMAGE_TAG=${backendImage}:${params.APP_ENV}-latest

                        # Docker Compose로 서비스 업데이트
                        docker-compose pull backend || true
                        docker-compose up -d backend

                        echo "⏳ 서비스 시작 대기..."
                        sleep 15

                        echo "🏥 헬스체크 수행..."
                        curl -f http://localhost:5010/api/health || {
                            echo "❌ 헬스체크 실패!"
                            docker-compose logs backend
                            exit 1
                        }

                        echo "✅ 백엔드 배포 완료!"
DEPLOYEOF
                """
            }
        } else {
            echo 'ℹ️ 백엔드 서버가 설정되지 않아 배포를 건너뜁니다.'
            echo '   서버 준비 후 BACKEND_SERVER_HOST 환경변수를 설정하세요.'
        }
    }
}
