<?php
declare(strict_types=1);

$recipients = [
    'sakai_tatunori@appdate-hd.co.jp',
    'syota_nodo@appdate-hd.co.jp',
];
$contact_address = 'info@denki-navi.jp';
$from_address = 'noreply@denki-navi.jp';
$mail_subject = '【電気開始窓口】WEB申し込みを受け付けました';
$staff_subject = '【電気時間外受付窓口】WEB申し込みを受け付けました。';

function send_utf8_mail(
    string $to,
    string $subject,
    string $message,
    string $from_address,
    string $reply_to
): bool {
    $encoded_subject = mb_encode_mimeheader($subject, 'UTF-8', 'B', "\r\n");
    $encoded_from_name = mb_encode_mimeheader('電気ナビ', 'UTF-8', 'B', "\r\n");
    $headers = [
        'MIME-Version: 1.0',
        'From: ' . $encoded_from_name . ' <' . $from_address . '>',
        'Reply-To: ' . $reply_to,
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: base64',
        'X-Mailer: PHP/' . PHP_VERSION,
    ];
    $encoded_message = rtrim(chunk_split(base64_encode($message)));

    return mail($to, $encoded_subject, $encoded_message, implode("\r\n", $headers));
}

function show_error_page(string $message, int $status = 400): void
{
    http_response_code($status);
    header('Content-Type: text/html; charset=UTF-8');
    ?>
<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <title>送信エラー｜深夜の電気再開受付窓口</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body class="subpage">
  <main class="document-main thanks-main">
    <article class="container narrow document-card thanks-card">
      <h1>送信できませんでした</h1>
      <p><?php echo htmlspecialchars($message, ENT_QUOTES, 'UTF-8'); ?></p>
      <a class="thanks-button" href="javascript:history.back()">入力画面へ戻る</a>
    </article>
  </main>
</body>
</html>
    <?php
    exit;
}

function post_text(string $key): string
{
    if (!isset($_POST[$key]) || is_array($_POST[$key])) {
        return '';
    }
    $value = trim((string) $_POST[$key]);
    $value = str_replace(["\0", "\r"], '', $value);
    return mb_substr($value, 0, 1000, 'UTF-8');
}

mb_language('Japanese');
mb_internal_encoding('UTF-8');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    show_error_page('不正なアクセスです。', 405);
}

if (post_text('website') !== '') {
    header('Location: thanks.html', true, 303);
    exit;
}

$situation = post_text('situation');
$preferred_day = post_text('preferred_day');
$preferred_time = post_text('preferred_time');
$preferred_service = post_text('preferred_service');
$name = post_text('name');
$name_kana = post_text('name_kana');
$tel = preg_replace('/[^0-9+\-\s()]/u', '', post_text('tel')) ?? '';
$email = filter_var(post_text('email'), FILTER_SANITIZE_EMAIL);
$postal = post_text('postal');
$start_date = post_text('start_date');
$address = post_text('address');
$remarks = post_text('remarks');
$privacy_agreement = post_text('privacy_agreement');

if (
    $situation !== '時間外・電気の引越し・開始・再開予約' ||
    $preferred_day === '' ||
    $preferred_time === '' ||
    $preferred_service === '' ||
    $name === '' ||
    $name_kana === '' ||
    $start_date === '' ||
    $tel === '' ||
    $privacy_agreement !== '1'
) {
    show_error_page('必須項目をご確認の上、もう一度送信してください。');
}

if ($email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
    show_error_page('メールアドレスの形式をご確認ください。');
}

$full_address_parts = [];
if ($postal !== '') {
    $full_address_parts[] = '〒' . $postal;
}
if ($address !== '') {
    $full_address_parts[] = $address;
}
$full_address = $full_address_parts !== [] ? implode(' ', $full_address_parts) : '未入力';

$staff_message = implode("\n", [
    '電気時間外受付窓口のLPから申し込みがありました。',
    '',
    '【希望サービス】',
    $preferred_service,
    '',
    '【希望曜日】',
    $preferred_day,
    '',
    '【希望時間帯】',
    $preferred_time,
    '',
    '【お名前】',
    $name,
    '',
    '【ふりがな】',
    $name_kana,
    '',
    '【利用開始希望日】',
    $start_date !== '' ? $start_date : '未入力',
    '',
    '【ご利用場所住所】',
    $full_address,
    '',
    '【電話番号】',
    $tel,
    '',
    '【メールアドレス】',
    $email !== '' ? $email : '未入力',
    '',
    '【備考】',
    $remarks !== '' ? $remarks : '未入力',
    '',
    '----------------------------------------',
    '',
    '差出人：' . $name,
    '',
    '【送信日時】',
    date('Y-m-d H:i:s'),
]);

$sent = send_utf8_mail(
    implode(', ', $recipients),
    $staff_subject,
    $staff_message,
    $from_address,
    $email !== '' ? $email : $contact_address
);

if (!$sent) {
    show_error_page('送信処理に失敗しました。恐れ入りますが、0120-186-556までお電話ください。', 500);
}

if ($email !== '') {
    $customer_message = implode("\n", [
        $name . ' 様',
        '',
        '電気開始窓口へお申し込みいただき、ありがとうございます。',
        '以下の内容で受け付けました。',
        '担当スタッフより順次お電話にてご連絡いたします。',
        '',
        '希望サービス：' . $preferred_service,
        '希望曜日：' . $preferred_day,
        '希望時間帯：' . $preferred_time,
        'お名前：' . $name,
        '電話番号：' . $tel,
        '',
        '※このメールは送信専用アドレスから自動送信されています。',
        '※このメールにお心当たりがない場合は、破棄してください。',
        '',
        '電話番号：0120-186-556',
        '受付時間：10:00-19:00',
    ]);

    send_utf8_mail(
        $email,
        $mail_subject,
        $customer_message,
        $from_address,
        $contact_address
    );
}

header('Location: thanks.html', true, 303);
exit;
