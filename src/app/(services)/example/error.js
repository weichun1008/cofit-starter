'use client';

// 每個模組都該有 error.js —— Next.js 會把它當成這個 route segment 的錯誤邊界，
// 讓區塊內 throw 的錯不會炸掉整頁（原型最怕的白屏）。複製模組時一起帶走。
export default function ExampleError({ error, reset }) {
  return (
    <div className="card" role="alert" style={{ margin: '24px', padding: '24px' }}>
      <h2>糟糕，這個區塊出錯了</h2>
      <p style={{ color: 'var(--text-secondary)' }}>{error.message}</p>
      {error.digest && (
        <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>ID: {error.digest}</p>
      )}
      <button type="button" onClick={() => reset()}>
        重試
      </button>
    </div>
  );
}
