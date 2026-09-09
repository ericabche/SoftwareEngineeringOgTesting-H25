<?php
$logFile = '/home/philipag/logs/webhook-calls.log';

$logDir = dirname($logFile);
if (!is_dir($logDir)) {
    mkdir($logDir, 0755, true);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $timestamp = date('Y-m-d H:i:s');
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $log = "$timestamp - Webhook triggered from IP: $ip\n";
    file_put_contents($logFile, $log, FILE_APPEND);
    
    $output = shell_exec('/home/philipag/bin/deploy.sh > /home/philipag/logs/deploy.log 2>&1 &');
    
    http_response_code(200);
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'success',
        'message' => 'Deployment triggered',
        'timestamp' => $timestamp
    ]);
} else {
    http_response_code(405);
    header('Content-Type: application/json');
    echo json_encode([
        'error' => 'Method not allowed',
        'message' => 'Only POST requests are accepted'
    ]);
}
?>
