pipeline {
    agent any
    environment {
        DOCKERHUB_CREDENTIALS = 'dockerhub-credentials'
        DOCKER_IMAGE = 'umarkhan335/devops-ticketing-system'
    }
    stages {
        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE}:latest ."
            }
        }
        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: "${DOCKERHUB_CREDENTIALS}", passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                    sh "docker login -u ${DOCKER_USERNAME} -p ${DOCKER_PASSWORD}"
                    sh "docker push ${DOCKER_IMAGE}:latest"
                }
            }
        }
        stage('Deploy') {
            steps {
                // We use 'sh' to set the timeout and run compose in one go
                sh "export COMPOSE_HTTP_TIMEOUT=300 && docker-compose down --remove-orphans"
                sh "export COMPOSE_HTTP_TIMEOUT=300 && docker-compose up -d"
            }
        }
    }
}