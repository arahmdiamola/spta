$csvPath = "C:\Users\LENOVO\.gemini\antigravity\scratch\spta\upload\parents_upload_template (4).csv"
$outputPath = "C:\Users\LENOVO\.gemini\antigravity\scratch\spta\upload\parents_upload_template_formatted.csv"

function Get-TitleCase {
    param([string]$text)
    if ([string]::IsNullOrWhiteSpace($text)) { return "" }
    $textInfo = (Get-Culture).TextInfo
    return $textInfo.ToTitleCase($text.ToLower())
}

function Fix-Name {
    param([string]$name)
    
    if ([string]::IsNullOrWhiteSpace($name)) { return "" }
    
    $parts = $name -split ',' | ForEach-Object { $_.Trim() }
    
    $lastName = ""
    $restName = ""
    
    if ($parts.Count -ge 3) {
        $lastName = $parts[0]
        $firstName = $parts[1]
        $middleName = $parts[2]
        
        if ($middleName -eq "-") { $middleName = "" }
        if ($firstName -eq "-") { $firstName = "" }
        
        $restName = "$firstName $middleName".Trim()
    }
    elseif ($parts.Count -eq 2) {
        $lastName = $parts[0]
        $restName = $parts[1]
        if ($restName -eq "-") { $restName = "" }
    }
    else {
        return (Get-TitleCase $parts[0])
    }
    
    $lastName = Get-TitleCase $lastName
    $restName = Get-TitleCase $restName
    
    if ([string]::IsNullOrWhiteSpace($restName)) {
        return $lastName
    } else {
        return "$lastName, $restName"
    }
}

$data = Import-Csv -Path $csvPath -Encoding Default

foreach ($row in $data) {
    $row."Parent Name" = Fix-Name $row."Parent Name"
    $row."Child Name" = Fix-Name $row."Child Name"
}

$data | Export-Csv -Path $outputPath -NoTypeInformation -Encoding Default
Write-Host "Formatting complete. Saved to $outputPath"
