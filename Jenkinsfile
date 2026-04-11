pipeline {
    agent any
    environment {
        DOCKERHUB_CREDENTIALS = 'dockerhub-credentials'
        DOCKER_IMAGE = 'umarkhan335/devops-ticketing-system'
    }
    stages {
        stage('Build') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE}:latest ."
            }
        }
        stage('Push') {
            steps {
                withCredentials([usernamePassword(credentialsId: "${DOCKERHUB_CREDENTIALS}", passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                    sh "echo \$DOCKER_PASSWORD | docker login -u \$DOCKER_USERNAME --password-stdin"
                    sh "docker push ${DOCKER_IMAGE}:latest"
                }
            }
        }
        stage('Deploy') {
            steps {
                // JENKINS_NODE_COOKIE prevents Jenkins from killing the background task
                withEnv(['JENKINS_NODE_COOKIE=dontKillMe']) {
                    // Run the commands entirely in the background so Jenkins immediately succeeds
                    sh "nohup docker-compose down --remove-orphans > /dev/null 2>&1 &"
                    sh "nohup docker-compose up -d > /dev/null 2>&1 &"
                }
            }
        }
    }
}