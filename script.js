const requestCropData = "./crops.json";
const cropSelect = document.getElementById("cropSelect");
const cropInfo = document.getElementById("cropInfo");
const seasonFilter = document.getElementById("seasonFilter");
const sortSelect = document.getElementById("sortSelect");

let cropsData = {};

async function loadCropData() {
  try {
    const response = await fetch(requestCropData);
    cropsData = await response.json();
    loadCropOptions();
  } catch (error) {
    console.error("Error loading crop data:", error);
  }
}

function loadCropOptions(crops) {
  cropSelect.innerHTML = "";
  
  (crops || cropsData.crops).forEach(crop => {
    const option = document.createElement("option");
    option.value = crop.plant_name;
    option.text = crop.plant_name;
    cropSelect.appendChild(option);
  });

  updateCropInfo();
}

function updateCropInfo() {
  const selectedCropName = cropSelect.value;
  const selectedCrop = cropsData.crops.find(crop => crop.plant_name === selectedCropName);
  
  if (selectedCrop) {
    cropInfo.innerHTML = `
      <h2>${selectedCrop.plant_name} <img src="${selectedCrop.image_url}" alt="${selectedCrop.plant_name}" width="50"></h2>
      <p>Growth Time: ${selectedCrop.time_until_harvest} days</p>
      ${selectedCrop.time_until_regrowth !== null ? `<p>Regrowth Time: ${selectedCrop.time_until_regrowth} days</p>` : ''}
      <p>Season: ${selectedCrop.season}</p>
      ${selectedCrop.seed_cost_pierre !== null ? `<p>Seed Cost Pierre: ${selectedCrop.seed_cost_pierre}</p>` : ''}
      ${selectedCrop.seed_cost_joja !== null ? `<p>Seed Cost Joja: ${selectedCrop.seed_cost_joja}</p>` : ''}
      ${selectedCrop.seed_cost_other !== null ? `<p>Seed Cost Other: ${selectedCrop.seed_cost_other}</p>` : ''}
      ${selectedCrop.crop_sell_price_regular !== null ? `<p>Crop Sell Price Regular: ${selectedCrop.crop_sell_price_regular} <img src="https://stardewvalleywiki.com/mediawiki/images/thumb/1/10/Gold.png/18px-Gold.png" alt="Gold" class="gold-icon"></p>` : ''}
      ${selectedCrop.crop_sell_price_silver !== null ? `<p>Crop Sell Price Silver: ${selectedCrop.crop_sell_price_silver} <img src="https://stardewvalleywiki.com/mediawiki/images/thumb/1/10/Gold.png/18px-Gold.png" alt="Gold" class="gold-icon"></p>` : ''}
      ${selectedCrop.crop_sell_price_gold !== null ? `<p>Crop Sell Price Gold: ${selectedCrop.crop_sell_price_gold} <img src="https://stardewvalleywiki.com/mediawiki/images/thumb/1/10/Gold.png/18px-Gold.png" alt="Gold" class="gold-icon"></p>` : ''}
      ${selectedCrop.crop_sell_price_iridium !== null ? `<p>Crop Sell Price Iridium: ${selectedCrop.crop_sell_price_iridium} <img src="https://stardewvalleywiki.com/mediawiki/images/thumb/1/10/Gold.png/18px-Gold.png" alt="Gold" class="gold-icon"></p>` : ''}
    `;
    calculateAndDisplayProfits(selectedCrop);
  } else {
    cropInfo.innerHTML = "<p>Select a crop to see information.</p>";
    document.getElementById("profitInfo").innerHTML = "";
  }
}


function filterCropsBySeason() {
  const selectedSeason = seasonFilter.value;
  let filteredCrops = [];

  if (selectedSeason === "Other") {
    filteredCrops = cropsData.crops.filter(crop => crop.season !== "Spring" && crop.season !== "Summer" && crop.season !== "Fall");
  } else if (selectedSeason === "All") {
    filteredCrops = cropsData.crops;
  } else {
    filteredCrops = cropsData.crops.filter(crop => crop.season === selectedSeason);
  }

  // Llamamos a sortCrops después de filtrar los cultivos por temporada
  sortCrops(filteredCrops);
}



function calculateAndDisplayProfits(selectedCrop) {
  const seedCost = selectedCrop.seed_cost_pierre || selectedCrop.seed_cost_joja || selectedCrop.seed_cost_other || 0;
  const cropPrices = [selectedCrop.crop_sell_price_regular, selectedCrop.crop_sell_price_silver, selectedCrop.crop_sell_price_gold, selectedCrop.crop_sell_price_iridium];
  
  let maxProfit = 0;
  let bestQuality = '';

  for (let i = 0; i < cropPrices.length; i++) {
    if (cropPrices[i] !== null) {
      const profit = cropPrices[i] - seedCost;
      if (profit > maxProfit) {
        maxProfit = profit;
        switch (i) {
          case 0:
            bestQuality = 'Regular';
            break;
          case 1:
            bestQuality = 'Silver';
            break;
          case 2:
            bestQuality = 'Gold';
            break;
          case 3:
            bestQuality = 'Iridium';
            break;
        }
      }
    }
  }

  const profitInfo = `
    <p>Potential Profits:</p>
    <ul>
      <li>Quality: ${bestQuality}</li>
      <li>Profit per Crop: ${maxProfit}</li>
      <li>Profit per 9 Crops: ${maxProfit * 9}</li>
    </ul>
  `;

  document.getElementById("profitInfo").innerHTML = profitInfo;
}


function sortCrops(filteredCrops) {
  const sortCriteria = sortSelect.value;

  let sortedCrops = filteredCrops.slice(); // Usamos los cultivos filtrados aquí

  switch (sortCriteria) {
    case "price_regular":
      sortedCrops.sort((a, b) => a.crop_sell_price_regular - b.crop_sell_price_regular);
      break;
    case "time_until_harvest":
      sortedCrops.sort((a, b) => a.time_until_harvest - b.time_until_harvest);
      break;
    // Agrega más criterios de ordenamiento según sea necesario
  }

  loadCropOptions(sortedCrops); // Llamamos a loadCropOptions con los cultivos ordenados
}

seasonFilter.addEventListener("change", filterCropsBySeason);
sortSelect.addEventListener("change", () => sortCrops(filterCropsBySeason())); // Usamos una función anónima para llamar a sortCrops
cropSelect.addEventListener("change", updateCropInfo);

loadCropData();

