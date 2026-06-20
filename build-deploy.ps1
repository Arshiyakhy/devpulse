# build-deploy.ps1
# Builds apps/api and packages/db, then assembles a self-contained deployment
# folder (devpulse-deploy/) suitable for zipping and uploading to Elastic
# Beanstalk. This avoids pnpm workspace references, since EB's npm install
# doesn't understand "workspace:*" dependencies.

$ErrorActionPreference = "Stop"

Write-Host "Building packages/db..." -ForegroundColor Cyan
Push-Location packages/db
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
pnpm build
Pop-Location

Write-Host "Building apps/api..." -ForegroundColor Cyan
Push-Location apps/api
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
pnpm build
Pop-Location

Write-Host "Assembling deployment folder..." -ForegroundColor Cyan
$deployDir = "devpulse-deploy"
Remove-Item -Recurse -Force $deployDir -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $deployDir | Out-Null

# Copy the compiled API code to the deploy root
Copy-Item -Recurse apps/api/dist/* $deployDir/

# Copy the compiled db package into a plain local folder (avoiding npm's
# quirky handling of file: references for @scoped packages)
Copy-Item -Recurse packages/db/dist "$deployDir/local-db/dist"
Copy-Item packages/db/package.json "$deployDir/local-db/package.json"

# Write a deployment-specific package.json with real dependency versions,
# no workspace:* references, pointing start script at the compiled entry
$apiPkg = Get-Content apps/api/package.json | ConvertFrom-Json
$deployPkg = [ordered]@{
    name         = "devpulse-api-deploy"
    version      = "1.0.0"
    type         = "module"
    main         = "index.js"
    scripts      = @{ start = "node index.js" }
    dependencies = [ordered]@{}
}
foreach ($dep in $apiPkg.dependencies.PSObject.Properties) {
    if ($dep.Name -ne "@devpulse/db") {
        $deployPkg.dependencies[$dep.Name] = $dep.Value
    }
}
# @devpulse/db is included as a local folder reference, not fetched from npm
$deployPkg.dependencies["@devpulse/db"] = "file:./local-db"

$deployPkg | ConvertTo-Json -Depth 10 | Set-Content "$deployDir/package.json"

Write-Host "Done. Deployment folder ready at ./$deployDir" -ForegroundColor Green
Write-Host "Next: cd $deployDir, then zip its contents for Elastic Beanstalk upload." -ForegroundColor Yellow