// 删除所有产品中的"默认规格"
// 在浏览器控制台运行此脚本

(function() {
  try {
    const stored = localStorage.getItem('products');
    if (!stored) {
      console.log('❌ 没有找到产品数据');
      return;
    }

    const products = JSON.parse(stored);
    let removedCount = 0;
    let totalRemoved = 0;

    console.log(`📦 开始处理 ${products.length} 个产品...`);

    products.forEach(product => {
      const beforeCount = product.specifications.length;
      product.specifications = product.specifications.filter(spec => spec.name !== '默认规格');
      const afterCount = product.specifications.length;
      const removed = beforeCount - afterCount;
      
      if (removed > 0) {
        removedCount++;
        totalRemoved += removed;
        console.log(`✅ 产品 "${product.name}" 删除了 ${removed} 个"默认规格"`);
      }
    });

    localStorage.setItem('products', JSON.stringify(products));
    
    console.log('');
    console.log('='.repeat(50));
    console.log(`✅ 成功！`);
    console.log(`   - 共处理 ${products.length} 个产品`);
    console.log(`   - 从 ${removedCount} 个产品中删除了 ${totalRemoved} 个"默认规格"`);
    console.log('='.repeat(50));
    console.log('');
    console.log('🔄 正在刷新页面...');
    
    setTimeout(() => {
      location.reload();
    }, 1000);
  } catch (e) {
    console.error('❌ 删除失败:', e);
  }
})();

