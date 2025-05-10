import { faker } from '@faker-js/faker'

function createRandomCarList(){
    return{
        name: faker.vehicle.vehicle(),
        fuelType: faker.vehicle.fuel(),
        model: faker.vehicle.model(),
        type: faker.vehicle.type(),
        
        image: `https://hips.hearstapps.com/hmg-prod/images/2025-audi-sq6-e-tron-115-666c7da0c4adb.jpg?crop=0.598xw:0.505xh;0.207xw,0.268xh&resize=700:*`,
        miles: 1000,
        gearType: 'Automatic',
        price: faker.finance.amount({min:5000,max:200000}),
    };
}

const carList = faker.helpers.multiple(createRandomCarList, {
    count: 7
})

export default {carList}