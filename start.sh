# [Unit]
# Description=handstack-docs
# 
# [Service]
# WorkingDirectory=/home/qcn/publish/linux-x64/handstack-docs/
# ExecStart=/home/qcn/publish/linux-x64/handstack-docs/handstack-docs
# SyslogIdentifier=handstack-docs
# User=qcn
# Restart=always
# RestartSec=10
# KillSignal=SIGINT
# Environment=QRAME_ENVIRONMENT=LNXP
# Environment=ASPNETCORE_ENVIRONMENT=Production
# Environment=DOTNET_PRINT_TELEMETRY_MESSAGE=false
# Environment=DOTNET_CLI_TELEMETRY_OPTOUT=true
# 
# [Install]
# WantedBy=multi-user.target

 sudo systemctl restart handstack-docs
 echo 0
