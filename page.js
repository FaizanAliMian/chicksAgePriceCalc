import { calculaterWeeksAndPrices } from 'backend/calculations.web';

$w.onReady(async function () {

    try {
        const response = await calculaterWeeksAndPrices();
        console.log("This the response", response);

        if (response.error) {
            console.error("Error fetching data: ", response.error);
            return;
        }

        const tableData = response.results;

        const tableRows = tableData.map(item => ({
            dateHatched: item.batchDate,
            ageWeeks: item.ageWeeks,
            plusDays : item.plusDays,
            ageInDays: item.ageInDays,
            price: item.price,
            datePointofLay: item.fullGrowthDate // for 126 days
        }));

        $w('#table2').rows = tableRows;

    } catch (error) {
        console.error("Error:", error.message);
    }
});
