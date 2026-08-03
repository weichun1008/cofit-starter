// 每個模組都該有 loading.js —— Next.js 在該 segment 的 async 資料還沒好時
// 自動顯示這個。用骨架而不是「Loading...」文字，感受上快得多。
export default function ExampleLoading() {
  return (
    <div style={{ padding: '24px' }} aria-busy="true" aria-label="載入中">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="card"
          style={{ height: '64px', marginBottom: '12px', opacity: 0.5 }}
        />
      ))}
    </div>
  );
}
