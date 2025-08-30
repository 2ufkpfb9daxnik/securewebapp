"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import zxcvbn from "zxcvbn";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    symbol: false,
  });
  const router = useRouter();

  // 厳しいパスワード強度チェック関数
  const checkPasswordCriteria = (password: string) => {
    const criteria = {
      length: password.length >= 12,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      symbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };
    return criteria;
  };

  // カスタムパスワード強度スコア計算
  const calculatePasswordStrength = (
    password: string,
    criteria: typeof passwordCriteria
  ) => {
    if (!password) return 0;

    const criteriaCount = Object.values(criteria).filter(Boolean).length;
    const zxcvbnResult = zxcvbn(password);

    // 全ての条件を満たさない場合は最大でもスコア2
    if (criteriaCount < 5) {
      return Math.min(zxcvbnResult.score, 2);
    }

    // 全条件を満たした場合はzxcvbnスコアを使用（最低3以上）
    return Math.max(zxcvbnResult.score, 3);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    const criteria = checkPasswordCriteria(newPassword);
    setPasswordCriteria(criteria);

    const strength = calculatePasswordStrength(newPassword, criteria);
    setPasswordStrength(strength);
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
        return "bg-gray-300";
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-yellow-500";
      case 3:
        return "bg-blue-500";
      case 4:
        return "bg-green-500";
      default:
        return "bg-gray-300";
    }
  };

  const passwordStrengthText = [
    "とても弱い",
    "弱い",
    "普通",
    "強い",
    "とても強い",
  ];

  // パスワード条件がすべて満たされているかチェック
  const isPasswordValid = () => {
    return (
      Object.values(passwordCriteria).every(Boolean) && password.length >= 12
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("パスワードが一致しません");
      return;
    }

    if (!isPasswordValid()) {
      setError(
        "パスワード強度が条件を満たしていません。12文字以上で、小文字・大文字・数字・記号を含む必要があります。"
      );
      return;
    }

    if (passwordStrength < 3) {
      setError(
        "パスワードが弱すぎます。より強力なパスワードを設定してください。"
      );
      return;
    }

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        setSuccess(
          "アカウントの作成に成功しました。ログインページに遷移します..."
        );
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        const data = await res.json();
        setError(data.error || "予期しないエラーが発生しました。");
      }
    } catch (err) {
      setError("サーバーへの接続に失敗しました。");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          アカウントを作成
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              パスワード
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                required
                className="w-full px-3 py-2 pr-10 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 mt-1"
              >
                <svg
                  className="w-5 h-5 text-gray-400 hover:text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {showPassword ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M14.12 14.12l1.415 1.415M14.12 14.12L9.878 9.878"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  )}
                </svg>
              </button>
            </div>

            {password && (
              <div className="mt-3 space-y-2">
                {/* パスワード強度バー */}
                <div>
                  <div className="w-full h-2 bg-gray-200 rounded">
                    <div
                      className={`h-full rounded transition-all duration-300 ${getPasswordStrengthColor()}`}
                      style={{ width: `${(passwordStrength + 1) * 20}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-right text-gray-500 mt-1">
                    {passwordStrengthText[passwordStrength]}
                  </p>
                </div>

                {/* パスワード条件チェックリスト */}
                <div className="text-xs space-y-1">
                  <div className="font-medium text-gray-700 mb-2">
                    パスワード条件:
                  </div>
                  <div
                    className={`flex items-center ${
                      passwordCriteria.length
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    <span className="mr-2">
                      {passwordCriteria.length ? "✓" : "✗"}
                    </span>
                    12文字以上
                  </div>
                  <div
                    className={`flex items-center ${
                      passwordCriteria.lowercase
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    <span className="mr-2">
                      {passwordCriteria.lowercase ? "✓" : "✗"}
                    </span>
                    小文字を含む (a-z)
                  </div>
                  <div
                    className={`flex items-center ${
                      passwordCriteria.uppercase
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    <span className="mr-2">
                      {passwordCriteria.uppercase ? "✓" : "✗"}
                    </span>
                    大文字を含む (A-Z)
                  </div>
                  <div
                    className={`flex items-center ${
                      passwordCriteria.number
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    <span className="mr-2">
                      {passwordCriteria.number ? "✓" : "✗"}
                    </span>
                    数字を含む (0-9)
                  </div>
                  <div
                    className={`flex items-center ${
                      passwordCriteria.symbol
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    <span className="mr-2">
                      {passwordCriteria.symbol ? "✓" : "✗"}
                    </span>
                    記号を含む (!@#$%^&*など)
                  </div>
                </div>
              </div>
            )}
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              パスワードを再度入力
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-3 py-2 pr-10 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 mt-1"
              >
                <svg
                  className="w-5 h-5 text-gray-400 hover:text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {showConfirmPassword ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M14.12 14.12l1.415 1.415M14.12 14.12L9.878 9.878"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
          {error && (
            <p className="text-sm font-medium text-center text-red-600">
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm font-medium text-center text-green-600">
              {success}
            </p>
          )}
          <button
            type="submit"
            className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            アカウントを作成
          </button>
        </form>
        <p className="text-sm text-center text-gray-600">
          アカウントを既に持っている場合{" "}
          <Link
            href="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            ログイン
          </Link>
        </p>
      </div>
    </div>
  );
}
