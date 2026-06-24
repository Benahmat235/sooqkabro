// Mock supabase
const supabase = {
  from: (table) => ({
    insert: async (data) => {
      // Simulate network latency (e.g. 50ms)
      await new Promise(resolve => setTimeout(resolve, 50));
      return { data, error: null };
    }
  })
};

const newListingImages = [
  { listing_id: "1", image_url: "url1", position: 1 },
  { listing_id: "1", image_url: "url2", position: 2 },
  { listing_id: "1", image_url: "url3", position: 3 },
  { listing_id: "1", image_url: "url4", position: 4 },
  { listing_id: "1", image_url: "url5", position: 5 },
];

async function runBenchmark() {
  console.log("Benchmarking N+1 vs Bulk Insert...");

  // N+1 approach
  const start1 = performance.now();
  for (let i = 0; i < newListingImages.length; i++) {
    await supabase.from("listing_images").insert(newListingImages[i]);
  }
  const end1 = performance.now();
  console.log(`N+1 approach took: ${(end1 - start1).toFixed(2)}ms`);

  // Bulk Insert approach
  const start2 = performance.now();
  if (newListingImages.length > 0) {
    await supabase.from("listing_images").insert(newListingImages);
  }
  const end2 = performance.now();
  console.log(`Bulk Insert approach took: ${(end2 - start2).toFixed(2)}ms`);

  console.log(`Improvement: ${(((end1 - start1) - (end2 - start2)) / (end1 - start1) * 100).toFixed(2)}% faster`);
}

runBenchmark();
