電気ナビ 時間外WEB受付LP（Xサーバー用・軽量版）
作成日: 2026-08-19
元コミット: a47df67

アップロード方法
1. このフォルダの中身を、Xサーバーの公開先ディレクトリへアップロードします。
2. imagesフォルダと.htaccessも含め、同じ階層構成を維持してください。
3. 公開後にindex.htmlの表示とフォーム送信をテストしてください。

動作条件
- PHP 7.4以上
- mbstringが有効であること
- PHPのmail関数が利用できること

フォーム送信先
- sakai_tatunori@appdate-hd.co.jp
- syota_nodo@appdate-hd.co.jp

送信元として noreply@denki-navi.jp を使用します。
Xサーバー側にdenki-navi.jpが設定されていることを確認してください。

キャッシュ対策
- HTML/PHPはキャッシュさせません。
- CSS/JavaScript/画像は長期キャッシュします。
- CSS/JavaScript更新時はindex.html内の ?v= の値を変更してください。
