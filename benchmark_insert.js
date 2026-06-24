const performance = require('perf_hooks').performance;

// Mock supabase insert
const mockSupabase = {
  from: () => ({
    insert: async (data) => {
      // simulate network delay
      await new Promise(resolve => setTimeout(resolve, 50));
      return { error: null };
    }
  })
};

async function testNPlus1(numImages) {
  const start = performance.now();
  for (let i = 0; i < numImages; i++) {
    await mockSupabase.from('listing_images').insert({
      listing_id: '123',
      image_url: 'http://example.com/image.jpg',
      position: i,
    });
  }
  return performance.now() - start;
}

async function testBatch(numImages) {
  const start = performance.now();
  const images = [];
  for (let i = 0; i < numImages; i++) {
    images.push({
      listing_id: '123',
      image_url: 'http://example.com/image.jpg',
      position: i,
    });
  }
  await mockSupabase.from('listing_images').insert(images);
  return performance.now() - start;
}

async function run() {
  const numImages = 5;
  const nPlus1Time = await testNPlus1(numImages);
  const batchTime = await testBatch(numImages);
  console.log(`N+1 time for ${numImages} images: ${nPlus1Time.toFixed(2)}ms`);
  console.log(`Batch time for ${numImages} images: ${batchTime.toFixed(2)}ms`);
  console.log(`Improvement: ${((nPlus1Time - batchTime) / nPlus1Time * 100).toFixed(2)}%`);
}

run();
