require("dotenv").config();

const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");

const app = express();

const stripe = Stripe(
    process.env.STRIPE_SECRET_KEY
);

const PORT =
    process.env.PORT || 10000;


/* =====================================================
   MIDDLEWARE
===================================================== */

app.use(
    cors({
        origin: true
    })
);

app.use(
    express.json()
);


/* =====================================================
   PRODUCTS
===================================================== */

const PRODUCTS = {

    diamonds_50: {
        name: "50 Diamonds",
        diamonds: 50,
        price: 3999
    },

    diamonds_100: {
        name: "100 Diamonds",
        diamonds: 100,
        price: 6999
    },

    diamonds_250: {
        name: "250 Diamonds",
        diamonds: 250,
        price: 14999
    },

    diamonds_500: {
        name: "500 Diamonds",
        diamonds: 500,
        price: 24999
    },

    diamonds_1000: {
        name: "1000 Diamonds",
        diamonds: 1000,
        price: 39999
    }

};


/* =====================================================
   HEALTH CHECK
===================================================== */

app.get(
    "/",
    (req, res) => {

        res.json({
            status: "ok",
            service: "LootRush Stripe Server"
        });

    }
);


/* =====================================================
   CREATE STRIPE CHECKOUT
===================================================== */

app.post(
    "/create-checkout-session",
    async (req, res) => {

        try {

            const {
                productId
            } = req.body;

            const product =
                PRODUCTS[productId];

            if (!product) {

                return res.status(400).json({
                    error:
                        "Invalid product."
                });

            }


            const baseUrl =
                process.env.FRONTEND_URL ||
                "https://7st5zchchb-collab.github.io/LootRush";


            const session =
                await stripe.checkout.sessions.create({

                    mode: "payment",

                    line_items: [

                        {

                            price_data: {

                                currency: "usd",

                                product_data: {

                                    name:
                                        product.name,

                                    description:
                                        `${product.diamonds} Diamonds for LootRush`

                                },

                                unit_amount:
                                    product.price

                            },

                            quantity: 1

                        }

                    ],

                    success_url:
                        `${baseUrl}/?payment=success&diamonds=${product.diamonds}`,

                    cancel_url:
                        `${baseUrl}/?payment=cancel`,

                    metadata: {

                        productId:
                            productId,

                        diamonds:
                            String(
                                product.diamonds
                            )

                    }

                });


            res.json({
                url: session.url
            });


        } catch (error) {

            console.error(
                "Stripe error:",
                error
            );

            res.status(500).json({

                error:
                    "Could not create Stripe Checkout session."

            });

        }

    }
);


/* =====================================================
   START SERVER
===================================================== */

app.listen(
    PORT,
    () => {

        console.log(
            `LootRush Stripe server running on port ${PORT}`
        );

    }
);
