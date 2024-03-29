const bookingModel = require('../models/booking.model');
const config = require("../../src/config/config");
const { validateRole } = require("../../src/models/account.model");
const { dateFormat } = require('../config/config');

module.exports = {
    changeBookingStatus: async (req, res) => {
        try {
            const booking_id = req.params.booking_id;
            const state = req.params.state;
            let status;
            switch (state) {
                case 'approve':
                    status = config.bookingStatus.APPROVED;
                    break;
                case 'check_in':
                    status = config.bookingStatus.ON_GOING;
                    break;
                case 'cancel':
                    status = config.bookingStatus.CANCLED;
                    break;
                case 'check_out':
                    status = config.bookingStatus.COMPLETED;
                    break;
                default:
                    return res.status(400).send({
                        message: 'Invalid state'
                    });
            }
            const result = await bookingModel.changeBookingStatus(booking_id, status);
            if (result.affectedRows === 0) {
                res.status(404).send({
                    exitcode: 1,
                    message: 'Booking not found'
                });
            } else {
                res.status(200).send({
                    exitcode: 0,
                    message: 'Change booking status successfully',
                    booking_id: booking_id,
                    state: state,
                    status: status
                });
            }
        } catch (error) {
          console.log(error.message);
            res.status(500).send("Internal server error");
        }
    },
    cancelBooking: async (req, res) => {
        const { booking_id } = req.params;
        const cancelStatus = config.bookingStatus.CANCLED;
        try {
            const result = await bookingModel.changeBookingStatus(booking_id, cancelStatus);
            if (result.affectedRows === 0) {
                res.status(404).send({
                    exitcode: 1,
                    message: 'Booking not found'
                });
            } else {
                res.status(200).send({
                    exitcode: 0,
                    message: 'Cancel booking successfully',
                    booking_id: booking_id,
                    state: 'cancel',
                    status: cancelStatus
                });
            }
        } catch (error) {
          console.log(error.message);
            res.status(500).send("Internal server error");
        }
    },
    getAllBookings: async (req, res) => {
        try {
            const email = await req.payload.email;
            const validateResult = await validateRole(email);
            let result;
            if (validateResult === config.role.ADMIN) {
                result = await bookingModel.getAllBookings();
            } else {
                result = await bookingModel.getMyBookings(email);
            }
            if (result.length === 0) {
                console.log('No booking found');
                res.status(404).send('No booking found');

            } else {
                const bookingList = result.map(item => ({
                    booking_id: item.booking_id,
                    user_id: item.user_id,
                    bird_id: item.bird_id,
                    bird_name: item.bird_name,
                    user_name: item.name,
                    address: item.address,
                    date_from: dateFormat(item.date_from),
                    date_to: dateFormat(item.date_to),
                    status: item.status,
                }));
                res.status(200).send({
                    exitcode: 0,
                    message: 'Get all bookings successfully',
                    bookings: bookingList
                });
            }
        } catch (error) {
          console.log(error.message);
            res.status(500).send("Internal server error");
        }
    },
    getBookingServices: async (req, res) => {
        try {
            const booking_id = req.params.booking_id;
            const result = await bookingModel.getBookingServices(booking_id);
            if (result.length === 0) {
                console.log('No booking found');
                res.status(400).send('No booking found');
            } else {
                res.status(200).send({
                    exitcode: 0,
                    message: 'Get booking services successfully',
                    services: result
                });
            }
        } catch (error) {
          console.log(error.message);
            res.status(500).send("Internal server error");
        }
    },
    createBooking: async (req, res) => {
        try {
            const { user_id, bird_id, date_from, date_to, services } = req.body;
            const bookingStatus = config.bookingStatus.PENDING;
            const booking = {
                user_id: user_id,
                bird_id: bird_id,
                date_from: date_from,
                date_to: date_to,
                services: services,
                status: bookingStatus,
            };
            let check = await bookingModel.addNewBooking(booking);
            if (check === false) {
                console.log('Add new booking failed');
                res.status(400).send('Add new booking failed');
            } else {
                res.status(201).send({
                    exitcode: 0,
                    message: 'Create new booking successfully',
                });
            }
        } catch (error) {
          console.log(error.message);
            res.status(500).send("Internal server error");
        }
    },
    checkoutBooking: async(req, res) => {
        try {
            const { booking_id } = req.params;
            const { checkout_date, payment_method, total_service_amount } = req.body;
            const checkout_img_filename = req.file.filename;

            const payload = { booking_id, checkout_date, payment_method, checkout_img_filename, total_service_amount }
            // console.log(req.params.booking_id);
            // console.log(req.body);
            // console.log(checkout_img_filename);

            const result = await bookingModel.checkoutBooking(payload);
            if (result.affectedRows === 0) {
                res.status(402).send('Booking not found');
            }else{
                res.status(200).send({
                    exitcode: 0,
                    message: 'Checkout booking successfully',
                    payload: {
                        booking_id: booking_id,
                        checkout_date: checkout_date,
                        payment_method: payment_method,
                        checkout_img_filename: checkout_img_filename
                    }
                });
            }
        } catch (error) {
            console.log(error.message);
            res.status(500).send(error.message);
        }
    },
    registerNewBookingService: async (req, res) => {
        try {
            const newBookingService = req.body;   // array of service
            const booking_id = req.params.booking_id;
            const result = await bookingModel.registerNewBookingService(booking_id, newBookingService);
            if (result === false) {
                res.status(400).send('Register new booking service failed');
            } else {
                res.status(201).send({
                    exitcode: 0,
                    message: 'Register new booking service successfully',
                });
            }
        } catch (error) {
            console.log(error.message);
            res.status(500).send("Internal server error");
        }
    },
}