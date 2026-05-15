<?php
/**
 * Contact form handler — sends inquiry to site owner + confirmation to user.
 *
 * Setup:
 *   1. Download PHPMailer source files into ./lib/PHPMailer/:
 *        Exception.php, PHPMailer.php, SMTP.php
 *      (from https://github.com/PHPMailer/PHPMailer/tree/master/src)
 *   2. Copy config/mailer.config.example.php -> config/mailer.config.php
 *      and fill in your SMTP credentials (Gmail App Password recommended).
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

// Honeypot — if a bot filled this hidden field, silently succeed.
if (!empty($_POST['website'] ?? '')) {
    echo json_encode(['ok' => true]);
    exit;
}

$configPath = __DIR__ . '/config/mailer.config.php';
if (!file_exists($configPath)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Mail config missing. Contact site owner directly.']);
    exit;
}
$cfg = require $configPath;

require __DIR__ . '/lib/PHPMailer/Exception.php';
require __DIR__ . '/lib/PHPMailer/PHPMailer.php';
require __DIR__ . '/lib/PHPMailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$first   = trim((string)($_POST['first_name'] ?? ''));
$last    = trim((string)($_POST['last_name']  ?? ''));
$company = trim((string)($_POST['company']    ?? ''));
$email   = trim((string)($_POST['email']      ?? ''));
$phone   = trim((string)($_POST['phone']      ?? ''));
$message = trim((string)($_POST['message']    ?? ''));

$errors = [];
if ($first === '') {
    $errors['first_name'] = 'First name is required';
}
if ($last === '') {
    $errors['last_name'] = 'Last name is required';
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Enter a valid email';
}
if (mb_strlen($message) < 10) {
    $errors['message'] = 'Message must be at least 10 characters';
}
if ($phone !== '' && !preg_match('/^\d{3}-\d{3}-\d{4}$/', $phone)) {
    $errors['phone'] = 'Use format 555-555-5555';
}

if ($errors) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'errors' => $errors]);
    exit;
}

$fullName = $first . ' ' . $last;

function build_mailer(array $cfg): PHPMailer {
    $m = new PHPMailer(true);
    $m->isSMTP();
    $m->Host       = $cfg['smtp_host'];
    $m->SMTPAuth   = true;
    $m->Username   = $cfg['smtp_user'];
    $m->Password   = $cfg['smtp_pass'];
    $m->SMTPSecure = $cfg['smtp_secure'];
    $m->Port       = (int)$cfg['smtp_port'];
    $m->CharSet    = 'UTF-8';
    return $m;
}

try {
    // Inquiry email -> site owner
    $inquiry = build_mailer($cfg);
    $inquiry->setFrom($cfg['from_email'], $cfg['from_name']);
    $inquiry->addAddress($cfg['inquiry_to']);
    $inquiry->addReplyTo($email, $fullName);
    $inquiry->Subject = "Portfolio inquiry from {$fullName}";

    $body  = "New message from your portfolio contact form.\n";
    $body .= "----------------------------------------\n";
    $body .= "First name : {$first}\n";
    $body .= "Last name  : {$last}\n";
    $body .= "Company    : " . ($company !== '' ? $company : '—') . "\n";
    $body .= "Email      : {$email}\n";
    $body .= "Phone      : " . ($phone !== '' ? $phone : '—') . "\n";
    $body .= "----------------------------------------\n\n";
    $body .= "Message:\n{$message}\n";
    $inquiry->Body = $body;
    $inquiry->send();

    // Confirmation email -> user
    $confirm = build_mailer($cfg);
    $confirm->setFrom($cfg['from_email'], $cfg['from_name']);
    $confirm->addAddress($email, $fullName);
    $confirm->Subject = 'Thanks for reaching out';

    $confirmBody  = "Hi {$first},\n\n";
    $confirmBody .= "Thanks for reaching out through my portfolio — I received your message and will get back to you soon.\n\n";
    $confirmBody .= "For your records, here's what you sent:\n";
    $confirmBody .= "----------------------------------------\n";
    $confirmBody .= "{$message}\n";
    $confirmBody .= "----------------------------------------\n\n";
    $confirmBody .= "— Alex Metzger\n";
    $confirmBody .= "ametzger08@gmail.com · 575-805-9738\n";
    $confirm->Body = $confirmBody;
    $confirm->send();

    echo json_encode(['ok' => true]);
} catch (Exception $e) {
    error_log('Contact form mail error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => 'Could not send message. Please email me directly at ametzger08@gmail.com.',
    ]);
}
