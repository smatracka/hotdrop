# Run this script as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Warning "Please run this script as Administrator"
    Break
}

# Google Cloud SDK installation path
$gcloudPath = "C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\bin"

# Check if the path exists
if (Test-Path $gcloudPath) {
    # Get current PATH
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
    
    # Check if Google Cloud SDK is already in PATH
    if ($currentPath -notlike "*$gcloudPath*") {
        # Add Google Cloud SDK to PATH
        $newPath = $currentPath + ";" + $gcloudPath
        [Environment]::SetEnvironmentVariable("Path", $newPath, "Machine")
        Write-Host "Google Cloud SDK has been added to PATH successfully!"
        Write-Host "Please restart your terminal for the changes to take effect."
    } else {
        Write-Host "Google Cloud SDK is already in your PATH."
    }
} else {
    Write-Error "Google Cloud SDK installation not found at: $gcloudPath"
    Write-Host "Please make sure Google Cloud SDK is installed correctly."
} 