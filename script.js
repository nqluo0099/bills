// 分类数据
const EXPENSE_CATEGORIES = [
  { value: 'food', label: '餐饮' },
  { value: 'transport', label: '交通' },
  { value: 'shopping', label: '购物' },
  { value: 'rent', label: '房租' },
  { value: 'utilities', label: '水电' },
  { value: 'skincare', label: '护肤' },
  { value: 'social', label: '社交' },
  { value: 'education', label: '学习' },
  { value: 'medical', label: '医疗' },
  { value: 'entertainment', label: '娱乐' },
  { value: 'other_expense', label: '其他支出' },
];

const INCOME_CATEGORIES = [
  { value: 'salary', label: '工资' },
  { value: 'parttime', label: '兼职' },
  { value: 'redpacket', label: '红包' },
  { value: 'bonus', label: '奖金' },
  { value: 'investment', label: '理财' },
  { value: 'other_income', label: '其他收入' },
];

const STORAGE_KEY = 'personal_bills';
let bills = [];

function loadBills() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      bills = JSON.parse(stored);
    } catch (e) {
      bills = [];
    }
  }
}

function saveBillsToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bills));
}

function getBills() {
  return bills;
}

function saveBills(newBills) {
  bills = newBills;
  saveBillsToStorage();
}

function addBill(bill) {
  bills.push(bill);
  saveBillsToStorage();
}

function deleteBill(id) {
  bills = bills.filter(b => b.id !== id);
  saveBillsToStorage();
}

function formatCurrency(amount) {
  return Number(amount).toFixed(2);
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function getCategoryLabel(category, type) {
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const cat = categories.find(c => c.value === category);
  return cat ? cat.label : category;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getTodayDate() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

function switchPage(pageId) {
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
  document.querySelector(`[data-page="${pageId}"]`).classList.add('active');
  
  if (pageId === 'reports') {
    updateReports();
  }
}

function updateStats() {
  const bills = getBills();
  
  const totalIncome = bills
    .filter(b => b.type === 'income')
    .reduce((sum, b) => sum + Number(b.amount), 0);
  
  const totalExpense = bills
    .filter(b => b.type === 'expense')
    .reduce((sum, b) => sum + Number(b.amount), 0);
  
  const balance = totalIncome - totalExpense;
  
  document.getElementById('total-income').textContent = `¥${formatCurrency(totalIncome)}`;
  document.getElementById('total-expense').textContent = `¥${formatCurrency(totalExpense)}`;
  document.getElementById('balance').textContent = `¥${formatCurrency(balance)}`;
}

function renderBillList() {
  const bills = getBills();
  const listContainer = document.getElementById('bill-list');
  
  if (bills.length === 0) {
    listContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📝</div>
        <div class="empty-text">暂无账单记录</div>
        <div class="empty-hint">点击上方「添加账单」开始记录您的收支</div>
      </div>
    `;
    return;
  }
  
  const sortedBills = [...bills].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  listContainer.innerHTML = sortedBills.map(bill => `
    <div class="bill-item">
      <div class="bill-left">
        <div class="bill-type ${bill.type}">${bill.type === 'income' ? '+' : '-'}</div>
        <div class="bill-info">
          <div class="bill-category">${getCategoryLabel(bill.category, bill.type)}</div>
          <div class="bill-meta">${formatDate(bill.date)}${bill.remark ? ` · ${bill.remark}` : ''}</div>
        </div>
      </div>
      <div class="bill-right">
        <span class="bill-amount ${bill.type}">${bill.type === 'income' ? '+' : '-'}¥${formatCurrency(bill.amount)}</span>
        <button class="delete-btn" data-id="${bill.id}" onclick="handleDeleteBill('${bill.id}')">×</button>
      </div>
    </div>
  `).join('');
}

function handleDeleteBill(id) {
  if (confirm('确定要删除这条账单吗？此操作不可恢复。')) {
    deleteBill(id);
    updateStats();
    renderBillList();
    updateReports();
  }
}

function setupForm() {
  const typeButtons = document.querySelectorAll('.type-btn');
  const typeInput = document.getElementById('bill-type');
  const categorySelect = document.getElementById('bill-category');
  const form = document.getElementById('bill-form');
  
  document.getElementById('bill-date').value = getTodayDate();
  
  typeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      typeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      typeInput.value = btn.dataset.type;
      updateCategories(btn.dataset.type);
    });
  });
  
  function updateCategories(type) {
    const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    categorySelect.innerHTML = `<option value="">请选择分类</option>` + 
      categories.map(c => `<option value="${c.value}">${c.label}</option>`).join('');
  }
  
  updateCategories('expense');
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const bill = {
      id: generateId(),
      type: typeInput.value,
      category: categorySelect.value,
      amount: document.getElementById('bill-amount').value,
      date: document.getElementById('bill-date').value,
      remark: document.getElementById('bill-remark').value,
      createdAt: new Date().toISOString(),
    };
    
    addBill(bill);
    updateStats();
    renderBillList();
    updateReports();
    
    form.reset();
    document.getElementById('bill-date').value = getTodayDate();
    typeButtons.forEach(b => b.classList.remove('active'));
    document.querySelector('[data-type="expense"]').classList.add('active');
    typeInput.value = 'expense';
    updateCategories('expense');
  });
}

function updateReports() {
  const year = parseInt(document.getElementById('report-year').value);
  const month = parseInt(document.getElementById('report-month').value);
  
  updateMonthlyStats(year, month);
  updateCategoryChart('expense', year, month);
  updateMonthlyChart(year);
}

function updateMonthlyStats(year, month) {
  const bills = getBills();
  
  const monthlyBills = bills.filter(b => {
    const d = new Date(b.date);
    return d.getFullYear() === year && d.getMonth() + 1 === month;
  });
  
  const income = monthlyBills.filter(b => b.type === 'income').reduce((sum, b) => sum + Number(b.amount), 0);
  const expense = monthlyBills.filter(b => b.type === 'expense').reduce((sum, b) => sum + Number(b.amount), 0);
  
  document.getElementById('monthly-income').textContent = `¥${formatCurrency(income)}`;
  document.getElementById('monthly-expense').textContent = `¥${formatCurrency(expense)}`;
  document.getElementById('monthly-balance').textContent = `¥${formatCurrency(income - expense)}`;
}

function updateCategoryChart(type, year, month) {
  const bills = getBills();
  
  const filteredBills = bills.filter(b => {
    const d = new Date(b.date);
    return b.type === type && d.getFullYear() === year;
  });
  
  const categoryMap = {};
  filteredBills.forEach(b => {
    if (!categoryMap[b.category]) {
      categoryMap[b.category] = 0;
    }
    categoryMap[b.category] += Number(b.amount);
  });
  
  const total = Object.values(categoryMap).reduce((sum, val) => sum + val, 0);
  const container = document.getElementById('category-chart');
  
  if (total === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-text">暂无${type === 'income' ? '收入' : '支出'}数据</div></div>`;
    return;
  }
  
  const sortedCategories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);
  
  container.innerHTML = sortedCategories.map(([category, amount]) => {
    const percentage = ((amount / total) * 100).toFixed(1);
    return `
      <div class="category-item">
        <div class="category-bar-container">
          <div class="category-bar ${type}" style="width: ${percentage}%"></div>
        </div>
        <div class="category-info">
          <span class="category-name">${getCategoryLabel(category, type)}</span>
          <span class="category-amount">¥${formatCurrency(amount)}</span>
        </div>
      </div>
    `;
  }).join('');
}

function updateMonthlyChart(year) {
  const bills = getBills();
  
  const monthlyMap = {};
  for (let i = 1; i <= 12; i++) {
    monthlyMap[i] = { income: 0, expense: 0 };
  }
  
  bills.forEach(b => {
    const d = new Date(b.date);
    if (d.getFullYear() === year) {
      const month = d.getMonth() + 1;
      if (b.type === 'income') {
        monthlyMap[month].income += Number(b.amount);
      } else {
        monthlyMap[month].expense += Number(b.amount);
      }
    }
  });
  
  const container = document.getElementById('monthly-chart');
  const maxValue = Math.max(...Object.values(monthlyMap).map(m => Math.max(m.income, m.expense)), 1);
  
  container.innerHTML = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const data = monthlyMap[month];
    const incomeHeight = maxValue > 0 ? (data.income / maxValue) * 150 : 0;
    const expenseHeight = maxValue > 0 ? (data.expense / maxValue) * 150 : 0;
    
    return `
      <div class="monthly-bar-group">
        <div class="monthly-bar-container">
          ${incomeHeight > 0 ? `<div class="monthly-bar income" style="height: ${incomeHeight}px"></div>` : ''}
          ${expenseHeight > 0 ? `<div class="monthly-bar expense" style="height: ${expenseHeight}px"></div>` : ''}
        </div>
        <span class="monthly-label">${month}月</span>
      </div>
    `;
  }).join('');
}

function setupModal() {
  const modal = document.getElementById('monthly-modal');
  const closeBtn = document.getElementById('close-modal');
  const viewBtn = document.getElementById('view-month-bills');
  
  viewBtn.addEventListener('click', () => {
    const year = parseInt(document.getElementById('report-year').value);
    const month = parseInt(document.getElementById('report-month').value);
    
    document.getElementById('modal-title').textContent = `${year}年${month}月账单`;
    renderModalBills(year, month);
    modal.classList.add('active');
  });
  
  closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });
}

function renderModalBills(year, month) {
  const bills = getBills();
  
  const monthlyBills = bills.filter(b => {
    const d = new Date(b.date);
    return d.getFullYear() === year && d.getMonth() + 1 === month;
  });
  
  const container = document.getElementById('modal-bills');
  
  if (monthlyBills.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-text">本月暂无账单</div></div>`;
    return;
  }
  
  const sortedBills = [...monthlyBills].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  container.innerHTML = sortedBills.map(bill => `
    <div class="modal-bill-item">
      <div>
        <div>${getCategoryLabel(bill.category, bill.type)}</div>
        <div style="font-size: 12px; color: #9ca3af;">${formatDate(bill.date)}${bill.remark ? ` · ${bill.remark}` : ''}</div>
      </div>
      <span style="font-weight: bold; color: ${bill.type === 'income' ? '#ef4444' : '#22c55e'}">
        ${bill.type === 'income' ? '+' : '-'}¥${formatCurrency(bill.amount)}
      </span>
    </div>
  `).join('');
}

function setupCategoryTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      const year = parseInt(document.getElementById('report-year').value);
      const month = parseInt(document.getElementById('report-month').value);
      updateCategoryChart(tab.dataset.tab, year, month);
    });
  });
}

function setupFilters() {
  const yearSelect = document.getElementById('report-year');
  const currentYear = new Date().getFullYear();
  
  for (let i = currentYear; i >= currentYear - 5; i--) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = `${i}年`;
    yearSelect.appendChild(option);
  }
  
  document.getElementById('report-date').value = getTodayDate();
  
  yearSelect.addEventListener('change', updateReports);
  document.getElementById('report-month').addEventListener('change', updateReports);
  
  document.getElementById('view-day-bills').addEventListener('click', viewDayBills);
}

function setupExport() {
  document.getElementById('export-btn').addEventListener('click', exportAsImage);
}

function viewDayBills() {
  const date = document.getElementById('report-date').value;
  
  if (!date) {
    alert('请选择日期');
    return;
  }
  
  const bills = getBills();
  const dayBills = bills.filter(b => b.date === date);
  
  const title = document.getElementById('day-bill-title');
  const container = document.getElementById('day-bills');
  const summary = document.getElementById('day-summary');
  
  const dateObj = new Date(date);
  const dateStr = `${dateObj.getFullYear()}年${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
  title.textContent = `${dateStr} 账单详情`;
  
  if (dayBills.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📝</div>
        <div class="empty-text">${dateStr}暂无账单记录</div>
      </div>
    `;
    summary.style.display = 'none';
    return;
  }
  
  const sortedBills = [...dayBills].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  container.innerHTML = sortedBills.map(bill => `
    <div class="bill-item">
      <div class="bill-left">
        <div class="bill-type ${bill.type}">${bill.type === 'income' ? '+' : '-'}</div>
        <div class="bill-info">
          <div class="bill-category">${getCategoryLabel(bill.category, bill.type)}</div>
          <div class="bill-meta">${bill.remark || '无备注'}</div>
        </div>
      </div>
      <div class="bill-right">
        <span class="bill-amount ${bill.type}">${bill.type === 'income' ? '+' : '-'}¥${formatCurrency(bill.amount)}</span>
      </div>
    </div>
  `).join('');
  
  const dayIncome = dayBills.filter(b => b.type === 'income').reduce((sum, b) => sum + Number(b.amount), 0);
  const dayExpense = dayBills.filter(b => b.type === 'expense').reduce((sum, b) => sum + Number(b.amount), 0);
  const dayBalance = dayIncome - dayExpense;
  
  document.getElementById('day-income').textContent = `¥${formatCurrency(dayIncome)}`;
  document.getElementById('day-expense').textContent = `¥${formatCurrency(dayExpense)}`;
  document.getElementById('day-balance').textContent = `${dayBalance >= 0 ? '' : '-'}¥${formatCurrency(Math.abs(dayBalance))}`;
  
  document.getElementById('day-balance').style.color = '#3b82f6';
  
  summary.style.display = 'block';
}

function exportAsImage() {
  const range = document.getElementById('export-range').value;
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  let filteredBills = getBills();
  let title = '💰 个人收支账本';
  let subtitle = '全部账单记录';
  
  if (range === 'today') {
    filteredBills = filteredBills.filter(b => b.date === todayStr);
    title = '📅 今日账单';
    subtitle = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
  } else if (range === 'month') {
    filteredBills = filteredBills.filter(b => {
      const d = new Date(b.date);
      return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth();
    });
    title = '📊 本月账单';
    subtitle = `${today.getFullYear()}年${today.getMonth() + 1}月`;
  } else if (range === 'year') {
    filteredBills = filteredBills.filter(b => {
      const d = new Date(b.date);
      return d.getFullYear() === today.getFullYear();
    });
    title = '📈 本年账单';
    subtitle = `${today.getFullYear()}年`;
  }
  
  const sortedBills = [...filteredBills].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const cardWidth = 450;
  const headerHeight = 90;
  const itemHeight = 56;
  const padding = 24;
  
  const contentHeight = Math.max(sortedBills.length * itemHeight + 10, 80);
  const summaryHeight = 70;
  const totalHeight = headerHeight + contentHeight + summaryHeight + padding * 2;
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const scale = 2;
  
  canvas.width = cardWidth * scale;
  canvas.height = totalHeight * scale;
  ctx.scale(scale, scale);
  
  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(0, 0, cardWidth, totalHeight);
  
  const drawRoundedRect = (x, y, w, h, r) => {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fill();
  };
  
  ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  
  ctx.fillStyle = '#ffffff';
  drawRoundedRect(padding / 2, padding / 2, cardWidth - padding, totalHeight - padding, 20);
  ctx.shadowColor = 'transparent';
  
  const headerY = padding;
  
  ctx.fillStyle = '#2d3748';
  ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, cardWidth / 2, headerY + 35);
  
  ctx.fillStyle = '#718096';
  ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText(subtitle, cardWidth / 2, headerY + 58);
  
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, headerY + 75);
  ctx.lineTo(cardWidth - padding, headerY + 75);
  ctx.stroke();
  
  let y = headerY + 85;
  
  if (sortedBills.length === 0) {
    ctx.fillStyle = '#a0aec0';
    ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('暂无账单记录', cardWidth / 2, y + 25);
    y += 40;
  } else {
    sortedBills.forEach((bill, index) => {
      const typeColor = bill.type === 'income' ? '#ef4444' : '#38a169';
      const typeBg = bill.type === 'income' ? '#fff5f5' : '#f0fff4';
      
      ctx.fillStyle = typeBg;
      drawRoundedRect(padding, y, cardWidth - padding * 2, itemHeight - 6, 8);
      
      const typeX = padding + 14;
      const typeY = y + (itemHeight - 6) / 2;
      
      ctx.fillStyle = typeColor;
      ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(bill.type === 'income' ? '+' : '-', typeX + 12, typeY + 5);
      
      const textX = typeX + 34;
      
      ctx.fillStyle = '#2d3748';
      ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(getCategoryLabel(bill.category, bill.type), textX, y + 16);
      
      let metaStr = formatDate(bill.date);
      if (bill.remark) metaStr += ` · ${bill.remark}`;
      
      ctx.fillStyle = '#a0aec0';
      ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText(metaStr, textX, y + 34);
      
      const amount = `${bill.type === 'income' ? '+' : '-'}¥${formatCurrency(bill.amount)}`;
      ctx.fillStyle = typeColor;
      ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(amount, cardWidth - padding - 12, y + 25);
      
      y += itemHeight;
    });
  }
  
  y += 8;
  
  const totalIncome = filteredBills.filter(b => b.type === 'income').reduce((sum, b) => sum + Number(b.amount), 0);
  const totalExpense = filteredBills.filter(b => b.type === 'expense').reduce((sum, b) => sum + Number(b.amount), 0);
  const balance = totalIncome - totalExpense;
  
  ctx.fillStyle = '#f7fafc';
  drawRoundedRect(padding, y, cardWidth - padding * 2, summaryHeight - 5, 8);
  
  y += 12;
  
  const statWidth = (cardWidth - padding * 2) / 3;
  
  ctx.fillStyle = '#718096';
  ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('收入', padding + statWidth / 2, y + 12);
  
  ctx.fillStyle = '#ef4444';
  ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText(`¥${formatCurrency(totalIncome)}`, padding + statWidth / 2, y + 32);
  
  ctx.fillStyle = '#718096';
  ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText('支出', padding + statWidth + statWidth / 2, y + 12);
  
  ctx.fillStyle = '#38a169';
  ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText(`¥${formatCurrency(totalExpense)}`, padding + statWidth + statWidth / 2, y + 32);
  
  ctx.fillStyle = '#718096';
  ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText('结余', padding + statWidth * 2 + statWidth / 2, y + 12);
  
  ctx.fillStyle = '#3182ce';
  ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText(`${balance >= 0 ? '' : '-'}¥${formatCurrency(Math.abs(balance))}`, padding + statWidth * 2 + statWidth / 2, y + 32);
  
  const link = document.createElement('a');
  link.download = `账单_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

document.addEventListener('DOMContentLoaded', () => {
  loadBills();
  setupForm();
  setupModal();
  setupCategoryTabs();
  setupFilters();
  setupExport();
  
  updateStats();
  renderBillList();
  updateReports();
  
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchPage(btn.dataset.page));
  });
});
