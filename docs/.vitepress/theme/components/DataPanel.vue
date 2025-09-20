<script setup lang="ts"></script>

<template>
  <div class="panel">
    <div class="container">
      <section class="grid">
        <!-- 访问量统计项 -->
        <div class="stat-item">
          <div class="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="#646cff"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-label">总访问量</div>
            <div class="stat-value" id="busuanzi_value_site_pv"></div>
          </div>
        </div>

        <!-- 分隔符 -->
        <div class="divider">
          <svg width="40" height="40" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" fill="#818cf8"/>
          </svg>
        </div>

        <!-- 访客数统计项 -->
        <div class="stat-item">
          <div class="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 11C17.66 11 19 9.66 19 8C19 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 11 9.66 11 8C11 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C13.67 13 9 14.17 9 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z" fill="#646cff"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-label">访客数</div>
            <div class="stat-value" id="busuanzi_value_site_uv"></div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.panel {
  margin: 16px 0;
}

.container {
  background: linear-gradient(135deg, var(--vp-c-bg-soft) 0%, var(--vp-c-bg-alt) 100%);
  border-radius: 12px;
  width: 100%;
  max-width: 1152px;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--vp-c-divider);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.grid {
  padding: 16px 24px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: center;
  justify-items: center;
  gap: 16px;
}

/* 统计项样式 */
.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.stat-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
  transform: translateY(-2px);
}

.stat-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--vp-c-bg-soft);
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  font-weight: 500;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  font-variant-numeric: tabular-nums;
}

/* 分隔符样式 */
.divider {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.divider::before,
.divider::after {
  content: '';
  position: absolute;
  width: 40%;
  height: 1px;
  background-color: var(--vp-c-divider);
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 12px 16px;
  }

  .divider::before,
  .divider::after {
    display: none;
  }

  .divider {
    padding: 4px 0;
  }

  .stat-item {
    justify-content: center;
  }
}
</style>
