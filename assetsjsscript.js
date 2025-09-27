// 数据存储键名
const STORAGE_KEY = 'xiaodengDataManagementSystem';
const CATEGORY_KEY = 'xiaodengDataCategories';
const USER_KEY = 'xiaodengCurrentUser';

// 初始化数据
let dataItems = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let categories = JSON.parse(localStorage.getItem(CATEGORY_KEY)) || ['工作', '学习', '生活', '其他'];
let currentUser = JSON.parse(localStorage.getItem(USER_KEY)) || null;

// 用户账户（简单模拟，实际应用中应从服务器获取）
const users = [
    { username: 'admin', password: '123456', role: 'admin', displayName: '管理员' },
    { username: 'user', password: '123456', role: 'user', displayName: '普通用户' }
];

// DOM元素
const loginPage = document.getElementById('loginPage');
const appPage = document.getElementById('appPage');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userInfo = document.getElementById('userInfo');

const dataForm = document.getElementById('dataForm');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const dataList = document.getElementById('dataList');
const categorySelect = document.getElementById('category');
const categoryFilter = document.getElementById('categoryFilter');
const sortBy = document.getElementById('sortBy');
const exportBtn = document.getElementById('exportBtn');
const manageCategoriesBtn = document.getElementById('manageCategoriesBtn');
const categoryModal = document.getElementById('categoryModal');
const exportModal = document.getElementById('exportModal');
const newCategoryInput = document.getElementById('newCategory');
const addCategoryBtn = document.getElementById('addCategoryBtn');
const categoryListDiv = document.getElementById('categoryList');
const closeCategoryModal = document.getElementById('closeCategoryModal');
const closeExportModal = document.getElementById('closeExportModal');
const exportJSON = document.getElementById('exportJSON');
const exportCSV = document.getElementById('exportCSV');
const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const editIdInput = document.getElementById('editId');
const totalCount = document.getElementById('totalCount');
const categoryCount = document.getElementById('categoryCount');
const imageCount = document.getElementById('imageCount');
const imageUpload = document.getElementById('imageUpload');
const imagePreview = document.getElementById('imagePreview');
const imageModal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const closeModal = document.querySelector('.close-modal');

// 当前编辑的图片
let currentImages = [];

// 初始化
function init() {
    // 检查是否已登录
    if (currentUser) {
        showAppPage();
    } else {
        showLoginPage();
    }
    
    // 事件监听
    loginBtn.addEventListener('click', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
    dataForm.addEventListener('submit', handleFormSubmit);
    searchBtn.addEventListener('click', searchData);
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') searchData();
    });
    categoryFilter.addEventListener('change', filterData);
    sortBy.addEventListener('change', sortData);
    exportBtn.addEventListener('click', () => exportModal.style.display = 'flex');
    manageCategoriesBtn.addEventListener('click', showCategoryModal);
    addCategoryBtn.addEventListener('click', addCategory);
    closeCategoryModal.addEventListener('click', () => categoryModal.style.display = 'none');
    closeExportModal.addEventListener('click', () => exportModal.style.display = 'none');
    exportJSON.addEventListener('click', exportDataAsJSON);
    exportCSV.addEventListener('click', exportDataAsCSV);
    cancelEditBtn.addEventListener('click', cancelEdit);
    imageUpload.addEventListener('change', handleImageUpload);
    closeModal.addEventListener('click', () => imageModal.style.display = 'none');
    
    // 点击模态框外部关闭
    window.addEventListener('click', function(e) {
        if (e.target === categoryModal) categoryModal.style.display = 'none';
        if (e.target === exportModal) exportModal.style.display = 'none';
        if (e.target === imageModal) imageModal.style.display = 'none';
    });
    
    // 回车键登录
    passwordInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') handleLogin();
    });
}

// 显示登录页面
function showLoginPage() {
    loginPage.style.display = 'flex';
    appPage.style.display = 'none';
    usernameInput.value = '';
    passwordInput.value = '';
}

// 显示主应用页面
function showAppPage() {
    loginPage.style.display = 'none';
    appPage.style.display = 'block';
    
    // 更新用户信息
    userInfo.textContent = `欢迎，${currentUser.displayName}`;
    
    // 根据用户角色显示/隐藏管理功能
    if (currentUser.role === 'admin') {
        document.body.classList.add('logged-in');
    } else {
        document.body.classList.remove('logged-in');
    }
    
    updateCategorySelects();
    renderDataList();
    updateStats();
}

// 处理登录
function handleLogin() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    
    if (!username || !password) {
        alert('请输入用户名和密码！');
        return;
    }
    
    // 验证用户
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
        showAppPage();
    } else {
        alert('用户名或密码错误！');
    }
}

// 处理退出登录
function handleLogout() {
    currentUser = null;
    localStorage.removeItem(USER_KEY);
    showLoginPage();
}

// 显示分类管理模态框
function showCategoryModal() {
    categoryModal.style.display = 'flex';
    renderCategoryList();
}

// 更新统计信息
function updateStats() {
    totalCount.textContent = dataItems.length;
    categoryCount.textContent = categories.length;
    
    // 计算图片总数
    let totalImages = 0;
    dataItems.forEach(item => {
        if (item.images && item.images.length) {
            totalImages += item.images.length;
        }
    });
    imageCount.textContent = totalImages;
}

// 更新分类选择器
function updateCategorySelects() {
    // 清空选项
    categorySelect.innerHTML = '<option value="">选择分类</option>';
    categoryFilter.innerHTML = '<option value="">所有分类</option>';
    
    // 添加分类选项
    categories.forEach(category => {
        categorySelect.innerHTML += `<option value="${category}">${category}</option>`;
        categoryFilter.innerHTML += `<option value="${category}">${category}</option>`;
    });
}

// 保存数据到本地存储
function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataItems));
    localStorage.setItem(CATEGORY_KEY, JSON.stringify(categories));
    updateStats();
}

// 渲染数据列表
function renderDataList(items = dataItems) {
    if (items.length === 0) {
        dataList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <p>没有找到匹配的数据</p>
            </div>
        `;
        return;
    }
    
    dataList.innerHTML = items.map(item => `
        <div class="data-item" data-id="${item.id}">
            <div class="data-title">
                ${escapeHtml(item.title)}
                <span class="category-tag">${escapeHtml(item.category)}</span>
            </div>
            <div class="data-content">${escapeHtml(item.content)}</div>
            ${item.images && item.images.length ? `
                <div class="data-images">
                    ${item.images.map((img, index) => `
                        <img src="${img}" alt="图片${index+1}" class="data-image" onclick="openImageModal('${img}')">
                    `).join('')}
                </div>
            ` : ''}
            <div class="data-meta">
                <span>添加时间: ${formatDate(item.timestamp)}</span>
                <span>最后修改: ${formatDate(item.lastModified || item.timestamp)}</span>
            </div>
            ${currentUser.role === 'admin' ? `
            <div class="data-actions">
                <button class="action-btn btn-outline edit-btn" data-id="${item.id}">
                    <i class="fas fa-edit"></i> 编辑
                </button>
                <button class="action-btn btn-danger delete-btn" data-id="${item.id}">
                    <i class="fas fa-trash"></i> 删除
                </button>
            </div>
            ` : ''}
        </div>
    `).join('');
    
    // 添加编辑和删除事件监听（仅管理员）
    if (currentUser.role === 'admin') {
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                editData(id);
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                deleteData(id);
            });
        });
    }
}

// 打开图片查看模态框
function openImageModal(imgSrc) {
    modalImage.src = imgSrc;
    imageModal.style.display = 'flex';
}

// 转义HTML特殊字符
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 格式化日期
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

// 处理图片上传
function handleImageUpload(e) {
    const files = e.target.files;
    if (!files.length) return;
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.match('image.*')) continue;
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            currentImages.push(e.target.result);
            
            // 添加预览
            const previewItem = document.createElement('div');
            previewItem.className = 'image-preview-item';
            previewItem.innerHTML = `
                <img src="${e.target.result}" alt="预览">
                <span class="remove-image" data-index="${currentImages.length - 1}">&times;</span>
            `;
            imagePreview.appendChild(previewItem);
            
            // 添加删除事件
            previewItem.querySelector('.remove-image').addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                currentImages.splice(index, 1);
                previewItem.remove();
                
                // 更新所有预览项的索引
                const allPreviews = imagePreview.querySelectorAll('.image-preview-item');
                allPreviews.forEach((item, idx) => {
                    item.querySelector('.remove-image').setAttribute('data-index', idx);
                });
            });
        };
        
        reader.readAsDataURL(file);
    }
    
    // 清空文件输入
    e.target.value = '';
}

// 处理表单提交
function handleFormSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('title').value.trim();
    const category = document.getElementById('category').value.trim();
    const content = document.getElementById('content').value.trim();
    const editId = editIdInput.value;
    
    if (title && category && content) {
        if (editId) {
            // 编辑现有数据
            const index = dataItems.findIndex(item => item.id === parseInt(editId));
            if (index !== -1) {
                dataItems[index] = {
                    ...dataItems[index],
                    title,
                    category,
                    content,
                    images: currentImages.length ? currentImages : dataItems[index].images,
                    lastModified: Date.now()
                };
            }
            cancelEdit();
        } else {
            // 添加新数据
            const newItem = {
                id: Date.now(),
                title,
                category,
                content,
                images: currentImages,
                timestamp: Date.now(),
                lastModified: Date.now()
            };
            
            dataItems.unshift(newItem);
        }
        
        saveData();
        renderDataList();
        dataForm.reset();
        imagePreview.innerHTML = '';
        currentImages = [];
        
        // 显示成功消息
        alert(editId ? '数据修改成功！' : '数据添加成功！');
    } else {
        alert('请填写所有字段！');
    }
}

// 编辑数据
function editData(id) {
    const item = dataItems.find(item => item.id === id);
    if (item) {
        document.getElementById('title').value = item.title;
        document.getElementById('category').value = item.category;
        document.getElementById('content').value = item.content;
        editIdInput.value = item.id;
        
        // 设置图片
        currentImages = item.images || [];
        imagePreview.innerHTML = '';
        
        currentImages.forEach((img, index) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'image-preview-item';
            previewItem.innerHTML = `
                <img src="${img}" alt="预览">
                <span class="remove-image" data-index="${index}">&times;</span>
            `;
            imagePreview.appendChild(previewItem);
            
            // 添加删除事件
            previewItem.querySelector('.remove-image').addEventListener('click', function() {
                const idx = parseInt(this.getAttribute('data-index'));
                currentImages.splice(idx, 1);
                previewItem.remove();
                
                // 更新所有预览项的索引
                const allPreviews = imagePreview.querySelectorAll('.image-preview-item');
                allPreviews.forEach((item, i) => {
                    item.querySelector('.remove-image').setAttribute('data-index', i);
                });
            });
        });
        
        submitBtn.innerHTML = '<i class="fas fa-save"></i> 保存修改';
        cancelEditBtn.style.display = 'inline-block';
    }
}

// 取消编辑
function cancelEdit() {
    dataForm.reset();
    editIdInput.value = '';
    imagePreview.innerHTML = '';
    currentImages = [];
    submitBtn.innerHTML = '<i class="fas fa-plus"></i> 添加数据';
    cancelEditBtn.style.display = 'none';
}

// 删除数据
function deleteData(id) {
    if (confirm('确定要删除这条数据吗？此操作不可撤销。')) {
        dataItems = dataItems.filter(item => item.id !== id);
        saveData();
        renderDataList();
        alert('数据删除成功！');
    }
}

// 搜索数据
function searchData() {
    const keyword = searchInput.value.trim().toLowerCase();
    filterData();
}

// 筛选数据
function filterData() {
    const keyword = searchInput.value.trim().toLowerCase();
    const category = categoryFilter.value;
    
    let filteredItems = dataItems;
    
    // 关键词搜索
    if (keyword) {
        filteredItems = filteredItems.filter(item => 
            item.title.toLowerCase().includes(keyword) ||
            item.category.toLowerCase().includes(keyword) ||
            item.content.toLowerCase().includes(keyword)
        );
    }
    
    // 分类筛选
    if (category) {
        filteredItems = filteredItems.filter(item => item.category === category);
    }
    
    // 排序
    sortData(filteredItems);
}

// 排序数据
function sortData(items = dataItems) {
    const sortValue = sortBy.value;
    let sortedItems = [...items];
    
    switch(sortValue) {
        case 'newest':
            sortedItems.sort((a, b) => b.timestamp - a.timestamp);
            break;
        case 'oldest':
            sortedItems.sort((a, b) => a.timestamp - b.timestamp);
            break;
        case 'title':
            sortedItems.sort((a, b) => a.title.localeCompare(b.title));
            break;
    }
    
    renderDataList(sortedItems);
}

// 添加分类
function addCategory() {
    const newCategory = newCategoryInput.value.trim();
    if (newCategory && !categories.includes(newCategory)) {
        categories.push(newCategory);
        saveData();
        updateCategorySelects();
        renderCategoryList();
        newCategoryInput.value = '';
        alert(`分类 "${newCategory}" 添加成功！`);
    } else if (categories.includes(newCategory)) {
        alert('该分类已存在！');
    } else {
        alert('请输入有效的分类名称！');
    }
}

// 渲染分类列表
function renderCategoryList() {
    categoryListDiv.innerHTML = categories.map(category => `
        <div class="category-item">
            <span>${category}</span>
            <div class="category-actions">
                <button class="action-btn btn-outline edit-category-btn" data-category="${category}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn btn-danger delete-category-btn" data-category="${category}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    // 添加编辑分类事件监听
    document.querySelectorAll('.edit-category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            editCategory(category);
        });
    });
    
    // 添加删除分类事件监听
    document.querySelectorAll('.delete-category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            deleteCategory(category);
        });
    });
}

// 编辑分类
function editCategory(category) {
    const newName = prompt(`请输入新的分类名称：`, category);
    if (newName && newName.trim() && newName !== category) {
        if (categories.includes(newName)) {
            alert('该分类名称已存在！');
            return;
        }
        
        // 更新分类名称
        const index = categories.indexOf(category);
        categories[index] = newName;
        
        // 更新数据中的分类
        dataItems.forEach(item => {
            if (item.category === category) {
                item.category = newName;
            }
        });
        
        saveData();
        updateCategorySelects();
        renderCategoryList();
        renderDataList();
        alert(`分类名称已从"${category}"修改为"${newName}"！`);
    }
}

// 删除分类
function deleteCategory(category) {
    // 检查是否有数据使用该分类
    const hasData = dataItems.some(item => item.category === category);
    
    if (hasData) {
        alert(`无法删除分类 "${category}"，因为仍有数据使用该分类。请先修改或删除相关数据。`);
        return;
    }
    
    if (confirm(`确定要删除分类 "${category}" 吗？`)) {
        categories = categories.filter(c => c !== category);
        saveData();
        updateCategorySelects();
        renderCategoryList();
        alert(`分类 "${category}" 删除成功！`);
    }
}

// 导出数据为JSON
function exportDataAsJSON() {
    const dataStr = JSON.stringify(dataItems, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    downloadFile(dataBlob, 'xiaodeng_data_export.json');
    exportModal.style.display = 'none';
}

// 导出数据为CSV
function exportDataAsCSV() {
    if (dataItems.length === 0) {
        alert('没有数据可导出！');
        return;
    }
    
    // 创建CSV标题行
    const headers = ['ID', '标题', '分类', '内容', '图片数量', '添加时间', '最后修改时间'];
    let csvContent = headers.join(',') + '\n';
    
    // 添加数据行
    dataItems.forEach(item => {
        const row = [
            item.id,
            `"${item.title.replace(/"/g, '""')}"`,
            `"${item.category.replace(/"/g, '""')}"`,
            `"${item.content.replace(/"/g, '""')}"`,
            item.images ? item.images.length : 0,
            `"${formatDate(item.timestamp)}"`,
            `"${formatDate(item.lastModified || item.timestamp)}"`
        ];
        csvContent += row.join(',') + '\n';
    });
    
    const dataBlob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
    downloadFile(dataBlob, 'xiaodeng_data_export.csv');
    exportModal.style.display = 'none';
}

// 下载文件
function downloadFile(blob, filename) {
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 初始化应用
document.addEventListener('DOMContentLoaded', init);