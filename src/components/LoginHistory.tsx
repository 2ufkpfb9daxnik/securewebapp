"use client";

import { useState, useEffect } from "react";

// 履歴アイテムの型を定義
interface HistoryItem {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  loginAt: string;
}

export default function LoginHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // コンポーネントがマウントされた時に履歴データを取得
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/login-history");
        if (!res.ok) {
          throw new Error("Failed to fetch login history");
        }
        const data = await res.json();
        setHistory(data);
      } catch (err) {
        setError("Could not load login history.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []); // 空の依存配列で初回レンダリング時のみ実行

  // 読み込み中の表示
  if (loading)
    return (
      <p className="mt-4 text-center text-gray-500">
        ログイン履歴をロード中...
      </p>
    );

  // エラー発生時の表示
  if (error) return <p className="mt-4 text-center text-red-500">{error}</p>;

  // 履歴データの表示
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold text-gray-700">
        最近のログイン履歴
      </h2>
      <div className="mt-4 overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                日時
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                IPアドレス
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                クライアント
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {history.length > 0 ? (
              history.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(item.loginAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.ipAddress}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
                    {item.userAgent}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                  ログイン履歴がありません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
