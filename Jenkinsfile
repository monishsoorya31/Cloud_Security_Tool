pipeline {
    agent any

    environment {
        // The ID of the SSH credential stored in Jenkins
        SSH_CREDS_ID = 'gcp-vm-ssh-key' // Replace if you name it differently in Jenkins
        
        // Your GCP VM details
        VM_IP = '136.112.133.78' 
        VM_USER = 'monish-soorya' 
        
        // The path to your repository on the GCP VM
        REPO_DIR = 'PLAYINGWITHLLM' 
    }

    stages {
        stage('Checkout') {
            steps {
                // Jenkins automatically checks out the code when using Pipeline from SCM, 
                // but this explicitly logs it.
                checkout scm
            }
        }
        
        stage('Deploy to GCP VM') {
            steps {
                script {
                    // Requires the SSH Agent Plugin installed in Jenkins
                    sshagent(credentials: [env.SSH_CREDS_ID]) {
                        // Connect to the VM via SSH, navigate to the repo, and run the deploy script
                        sh """
                            ssh -o StrictHostKeyChecking=no ${env.VM_USER}@${env.VM_IP} '
                                cd ~/${env.REPO_DIR} &&
                                bash scripts/deploy.sh
                            '
                        """
                    }
                }
            }
        }
    }
    
    post {
        success {
            echo "Pipeline completed successfully! The app should now be live on the GCP VM."
        }
        failure {
            echo "Pipeline failed. Check the logs for errors."
        }
    }
}
