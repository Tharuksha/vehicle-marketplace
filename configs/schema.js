import { json } from 'drizzle-orm/gel-core'
import { pgTable, serial, varchar, text, integer } from 'drizzle-orm/pg-core'

export const CarListing = pgTable('carListing', {
    id: serial('id').primaryKey(),
    listingTitle: varchar('listingTitle').notNull(),
    tagline: varchar('tagline'),
    originalPrice: varchar('originalPrice'),
    sellingPrice: varchar('sellingPrice').notNull(),
    category: varchar('category').notNull(),
    make: varchar('make').notNull(),
    model: varchar('model').notNull(),
    condition: varchar('condition').notNull(),
    year: varchar('year').notNull(),
    driveType: varchar('driveType').notNull(),
    fuelType: varchar('fuelType').notNull(),
    transmission: varchar('transmission').notNull(),
    color: varchar('color').notNull(),
    mileage: varchar('mileage').notNull(),
    engineSize: varchar('engineSize'),
    cylinder: varchar('cylinder'),
    door: varchar('door').notNull(),
    vin: varchar('vin'),
    offerType: varchar('offerType'),
    listingDescription: text('listingDescription').notNull(),
    features: json('features')
})

export const CarImages = pgTable('carImages', {
    id: serial('id').primaryKey(),
    imageUrl: varchar('imageUrl').notNull(),
    storageId: varchar('storageId').notNull(),
    carListingId: integer('carListingId').references(() => CarListing.id).notNull()
})
