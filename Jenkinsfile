pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = 'dockerhub-credentials'
        DOCKER_IMAGE = 'umarkhan335/devops-ticketing-system'
    }

    stages {
        stage('Build Docker Image') {
            steps {
                // Building from the sub-folder
                sh "docker build -t ${DOCKER_IMAGE}:latest devops-ticketing-system/"
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

        stage('Deploy with Docker Compose') {
            steps {
                dir('devops-ticketing-system') {
                    sh "docker-compose down"
                    sh "docker-compose up -d"
                }
            }
        }
    }
}