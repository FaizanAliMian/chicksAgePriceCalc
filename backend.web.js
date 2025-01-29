/************
import { multiply } from 'backend/new-module.web';
****/
import { Permissions, webMethod } from "wix-web-module";
import wixData from 'wix-data';

export const calculateWeeksPlusDays = webMethod(
    Permissions.Anyone,
    async () => {
        try {
            let result = await wixData.query("BatchList").find();
            console.log("this the result", result);

            if (result.items.length > 0) {
                const today = new Date();
                //console.log("Today = ", today);

                const differences = result.items.map((item) => {
                    const dateInString = item.date;
                    //console.log("this the string date ", dateInString);
                    const parsedDate = new Date(dateInString);
                    //console.log("this the parsed date ", parsedDate);

                    const diffInMs = today.getTime() - parsedDate.getTime();
                    //console.log("this the diff in ms ", diffInMs);

                    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
                    //console.log("this the diff in days ", diffInDays);

                    const weeks = Math.floor(diffInDays / 7);
                    const days = diffInDays % 7;

                    return {
                        id: item._id,
                        date: dateInString,
                        difference: `${weeks} week${weeks !== 1 ? 's' : ''} plus ${days} day${days !== 1 ? 's' : ''}`,
                        differenceInDays: diffInDays,
                        weeks,
                        days,
                    };
                });

                console.log("Date Differences ", differences);
                return { differences };
            } else {
                console.log("No data found in cms for dates");
                return { message: "No data found in BatchList collection" };
            }

        } catch (error) {
            console.log("error:", error.message);
            return { error: error.message };
        }
    }
);

export const calculatePrice = webMethod(
    Permissions.Anyone,
    async (weeks) => {
        try {
            let priceResult = await wixData.query("PriceinWeeks").find();
            console.log("this the prices", priceResult);

            if (priceResult.items.length > 0) {
                const pricingTable = priceResult.items;

                const matchingWeek = pricingTable.find((item) => item.ageInWeeks === weeks);
                if (matchingWeek) {
                    console.log(`Price for ${weeks} week(s):`, matchingWeek.price);
                    return { week: weeks, price: matchingWeek.price };
                } else {
                    console.log(`No price found for ${weeks} week(s)`);
                    return { message: `No price available for ${weeks} week(s)` };
                }
            } else {
                console.log("No data in cms for price");
                return { message: "No data found in PricingTable collection" };
            }

        } catch (error) {
            console.error("Error fetching price:", error.message);
            return { error: error.message };

        }
    }
);

export const calculaterWeeksAndPrices = webMethod(
    Permissions.Anyone,
    async () => {
        try {
            const weeksCalculation = await calculateWeeksPlusDays();
            if (weeksCalculation.error) {
                return weeksCalculation;
            }

            const differences = weeksCalculation.differences;
            console.log("this the differences for wp", differences);

            const resultsWithPrices = await Promise.all(
                differences.map(async (item) => {
                    const priceResult = await calculatePrice(item.weeks);

                    const batchDate = new Date(item.date);
                    const fullGrowthDate = new Date(batchDate);
                    fullGrowthDate.setDate(fullGrowthDate.getDate() + 126);
                    return {
                        batchDate: item.date,
                        ageWeeks: item.weeks,
                        plusDays: item.days,
                        ageInDays: item.differenceInDays,
                        price: priceResult.price || "No Price Availble",
                        fullGrowthDate: fullGrowthDate.toISOString().split('T')[0],

                    };

                })
            );
            console.log("Results for weeks and prices:", resultsWithPrices);
            return { results: resultsWithPrices };

        } catch (error) {
            console.error("Error calculating weeks and prices:", error.message);
            return { error: error.message };
        }
    }
);
