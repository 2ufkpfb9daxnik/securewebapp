// NextAuthのGETおよびPOSTハンドラをエクスポート
// すべてのリクエストをキャッチしてNextAuth.jsライブラリに転送
import { handlers } from "@/auth";
export const { GET, POST } = handlers;

