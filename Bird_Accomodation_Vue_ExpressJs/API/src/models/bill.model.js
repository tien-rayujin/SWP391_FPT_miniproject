const config = require('../config/config');
const sql = require("mssql");

module.exports = {
    getBillContentOfBooking_id: async (booking_id) => {
        let con = await config.connection();
        const request = con.request();
        const dataContent = await request
            .input('booking_id', sql.Int, booking_id)
            .query("select u.name as user_name, u.email, u.address, u.phone, bi.bird_name, bt.name as type, bi.gender, bi.description, bi.image, b.booking_id, b.date_from, b.date_to, bil.bill_id, \n" +
                "bil.total_service_amount, bil.checkout_date, bil.payment_method, bil.payment_status, bil.checkout_img \n" +
                "from Booking b join [User] u on b.user_id = u.user_id \n" +
                "join Bird bi on b.bird_id = bi.bird_id \n" +
                "join BirdType bt on bi.type_id = bt.btype_id \n" +
                "join Bill bil on bil.booking_id = b.booking_id \n" +
                // "join Review re on bil.booking_id = re.booking_id \n" +
                "where b.booking_id = @booking_id")

        const result = [];
        dataContent.recordset.forEach(data => {
            result.push({
                user: {
                    name: data.user_name,
                    email: data.email,
                    phone: data.phone,
                    address: data.address
                },
                bird: {
                    bird_name: data.bird_name,
                    bird_type: data.type,
                    gender: data.gender,
                    image: data.image,
                    description: data.description
                },
                booking: {
                    booking_id: data.booking_id,
                    date_from: config.dateFormat(data.date_from),
                    date_to: config.dateFormat(data.date_to),
                },
                // review: {
                //     rating: data.rating,
                //     comment: data.comment
                // },
                bill: {
                    bill_id: data.bill_id,
                    total_amount: data.total_service_amount,
                    checkout_date: config.dateFormat(data.checkout_date),
                    checkout_image: data.checkout_img,
                    payment_method: data.payment_method,
                    payment_status: data.payment_status
                }
            })
        })
        return result
    },

    getBillServiceOfBooking_id: async (booking_id) => {
        let con = await config.connection();
        const request = con.request();
        let service_total = 0;
        const dataService = await request
            .input("booking_id", sql.Int, booking_id)
            .query("select bd.bdetail_id, bd.service_id, s.name, s.isPack, s.image, bd.booked_price, bd.quantity, CASE  \n" +
                "WHEN bd.quantity = 0 THEN bd.booked_price \n" +
                "ELSE bd.quantity * bd.booked_price \n" +
                "END AS total_amount \n" +
                "from BookingDetail bd join Service s on bd.service_id = s.service_id \n" +
                "where bd.booking_id = @booking_id and s.status = 1")

        // total of service
        dataService.recordset.forEach(data => {
            service_total += data.total_amount
        })

        // map data
        const result = {
            service: [],
            total_service_amount: service_total
        };

        dataService.recordset.forEach(data => {
            result.service.push({
                service_id: data.service_id,
                name: data.name,
                isPack: data.isPack,
                booked_price: data.booked_price,
                quantity: data.quantity,
            })
        })

        return result
    },
}