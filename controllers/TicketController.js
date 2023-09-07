const db = require('../database');
const jwt = require('jsonwebtoken');
const MailService = require('../services/MailService');
const TicketControllers = {
    getMovieSchedule(req, res) {
        const moive_id = req.query.movie_id;
        const date = req.query.date;
        if(!moive_id || !date) {
            res.status(400).json({
                code: 400,
                message: 'Bad request'
            });
            return;
        }
        const sql = `SELECT
        sch.id AS schedule_id,
        sch.movie_id,
        m.name AS movie_name,
        sch.room_id,
        sch.theatre_id,
        CONVERT_TZ(sch.date, '-07:00', '+07:00') as date,
        sch.price,
        GROUP_CONCAT(DISTINCT st.start_time) AS start_times,
        GROUP_CONCAT(DISTINCT st.end_time) AS end_times,
        GROUP_CONCAT(DISTINCT st.id) AS schedule_time_ids,
        th.name AS theatre_name,
        th.address AS theatre_address,
        th.image AS theatre_image,
        r.name AS room_name,
        r.type AS room_type,
        r.capacity AS room_capacity
        FROM 
            schedule sch
        JOIN 
            theatre th ON sch.theatre_id = th.id
        JOIN 
            room r ON sch.room_id = r.id
        JOIN 
            schedule_time st ON sch.id = st.schedule_id
        JOIN
            movie m ON sch.movie_id = m.id
        WHERE 
            sch.movie_id = ? 
            AND DATE(sch.date) = ?
        GROUP BY sch.id, th.name, th.address, th.image, r.name, r.type, r.capacity;   
        `;
        db.queryParams(sql, [moive_id, date])
            .then((results) => {
                res.status(200).json({
                    code: 200,
                    message: 'Success',
                    data: results
                });
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json({
                    code: 500, 
                    message: 'Internal server error' 
                });
            });
    },
    addTicket: async (req, res) => {
        const { schedule_id, schedule_time_id, seat, food_combo_id, food_combo_quantity} = req.body;
    

        if (!schedule_id || !schedule_time_id || !seat) {
            console.log('Bad request');
            res.status(200).json({ 
                code: 400,
                message: 'Bad request' 
            });
            return;
        }

        const food_combo_idList = food_combo_id.split(',');
        const food_combo_quantityList = food_combo_quantity.split(',');

        const seatList = seat.split(',');

        const check = await checkSeat(schedule_time_id, seatList);

        if (!check) {
            res.status(200).json({
                code: 201, 
                message: 'Seat is not available' 
            });
            return;
        }

        const ticket_id = await addTicketAndSeatAndFoodComboList(seatList,schedule_id ,schedule_time_id, req.user.id, food_combo_idList, food_combo_quantityList);
        
        const ticket = await getTicketById(ticket_id);
        
        MailService.sendTicket(req.user.email, "Ticket", "Thank for purchase tickets" ,ticket);

        res.status(200).json({
            code: 200,
            message: 'Success',
            data: ticket
        });
    },
    getSeat: async (req, res) => {
        const schedule_time_id = req.query.schedule_time_id;
        const sql = `SELECT GROUP_CONCAT(name) AS seat_names
                    FROM seat
                    WHERE schedule_time_id = ?;
                    `;
        const results = await db.queryParams(sql, [schedule_time_id]);
        res.status(200).json({
            code: 200,
            message: 'Success',
            data: results[0].seat_names == null ? { seat_names : '' } : results[0]
        });
    },
    getTicketByAccountId: async (req, res) => {
        const account_id = req.user.id;
        if(account_id == null) {
            res.status(200).json({
                code: 400,
                message: 'Bad request'
            });
            return;
        }

        const sql = `SELECT
        t.id AS ticket_id,
        t.schedule_time_id,
        t.account_id,
        th.id AS theatre_id,
        th.name AS theatre_name,
        r.name AS room_name,
        st.start_time,
        st.end_time,
        CONVERT_TZ(sch.date, '-07:00', '+07:00') as date,
        sch.price,
        sch.movie_id,
        m.name AS movie_name,
        m.image AS movie_image,
        m.duration AS movie_duration,
        m.description AS movie_description,
        m.trailer AS movie_trailer,
        IFNULL(GROUP_CONCAT(DISTINCT s.name), '') AS seat_names,
        IFNULL(GROUP_CONCAT(DISTINCT f.id), '') AS food_combo_ids,
        IFNULL(GROUP_CONCAT(DISTINCT f.name), '') AS food_combo_names,
        IFNULL(GROUP_CONCAT(DISTINCT f.price), '') AS food_combo_prices,
        IFNULL(GROUP_CONCAT(DISTINCT f.image), '') AS food_combo_images,
        t.total
        FROM
            ticket t
        JOIN
            schedule_time st ON t.schedule_time_id = st.id
        JOIN
            schedule sch ON st.schedule_id = sch.id
        JOIN
            movie m ON sch.movie_id = m.id
        JOIN
            seat s ON t.id = s.ticket_id
        LEFT JOIN
            food_combo_ticket ft ON t.id = ft.ticket_id
        LEFT JOIN
            food_combo f ON ft.food_combo_id = f.id
        JOIN 
            theatre th ON sch.theatre_id = th.id
        JOIN
            room r ON sch.room_id = r.id
        WHERE
            t.account_id = ?
        GROUP BY
            t.id, st.start_time, st.end_time, sch.date, sch.price, sch.movie_id, m.name, m.image, m.duration, m.description, m.trailer
        ORDER BY t.createAt DESC;
    `;
        const results = await db.queryParams(sql, [account_id]);
        res.status(200).json({
            code: 200,
            message: 'Success',
            data: results
        });
    },
    getFoodCombo: async (req, res) => {
        const sql = `SELECT * FROM food_combo`;
        const results = await db.query(sql);
        res.status(200).json({
            code: 200,
            message: 'Success',
            data: results
        });
    },
    getAllTicket: async (req, res) => {
        const sql = `SELECT
        t.account_id,
        a.email,
        th.id AS theatre_id,
        th.name AS theatre_name,
        r.name AS room_name,
        t.id AS ticket_id,
        t.schedule_time_id,
        t.account_id,
        t.createAt,
        st.start_time,
        st.end_time,
        CONVERT_TZ(sch.date, '-07:00', '+07:00') as date,
        sch.price,
        sch.movie_id,
        m.name AS movie_name,
        m.image AS movie_image,
        m.duration AS movie_duration,
        m.description AS movie_description,
        m.trailer AS movie_trailer,
        IFNULL(GROUP_CONCAT(DISTINCT s.name), '') AS seat_names,
        IFNULL(GROUP_CONCAT(DISTINCT f.id), '') AS food_combo_ids,
        IFNULL(GROUP_CONCAT(DISTINCT f.name), '') AS food_combo_names,
        IFNULL(GROUP_CONCAT(DISTINCT f.price), '') AS food_combo_prices,
        IFNULL(GROUP_CONCAT(DISTINCT f.image), '') AS food_combo_images,
        t.total
        FROM
            ticket t
        JOIN
            schedule_time st ON t.schedule_time_id = st.id
        JOIN
            schedule sch ON st.schedule_id = sch.id
        JOIN
            movie m ON sch.movie_id = m.id
        JOIN
            seat s ON t.id = s.ticket_id
        LEFT JOIN
            food_combo_ticket ft ON t.id = ft.ticket_id
        LEFT JOIN
            food_combo f ON ft.food_combo_id = f.id
        JOIN
            account a ON t.account_id = a.id
        JOIN
            theatre th ON sch.theatre_id = th.id
        JOIN
            room r ON sch.room_id = r.id
        GROUP BY t.id, st.start_time, st.end_time, sch.date, sch.price, sch.movie_id, m.name, m.image, m.duration, m.description, m.trailer
        ORDER BY t.createAt DESC;
        `;

        const results = await db.query(sql);
        res.status(200).json({
            code: 200,
            message: 'Success',
            data: results
        });
    },


};  

async function checkSeat(schedule_time_id, seat) {
    for (let i = 0; i < seat.length; i++) {
        const sql = 'SELECT * FROM seat WHERE schedule_time_id = ? AND name = ?';
        const results = await db.queryParams(sql, [schedule_time_id, seat[i]]);
        if (results.length > 0) {
            return false;
        }
    }
    return true;
}

async function addTicketAndSeatAndFoodComboList(seatList,schedule_id ,schedule_time_id, account_id, food_combo_list = [], food_combo_quantity_list = []) {
    //Cal total price of ticket
    const moviePriceSql = 'SELECT price FROM schedule WHERE id = ?';
    const moviePriceResult = await db.queryParams(moviePriceSql, [schedule_id]);
    let moviePrice = Number(moviePriceResult[0].price);
    
    const foodComboPriceSql = 'SELECT price FROM food_combo WHERE id = ?';
    let foodComboPrice = 0;
    if(food_combo_list.length > 0 && !!food_combo_list[0]){
        for (let i = 0; i < food_combo_list.length; i++) {
            const foodComboPriceResult = await db.queryParams(foodComboPriceSql, [food_combo_list[i]]);
            foodComboPrice += Number(foodComboPriceResult[0].price)  * food_combo_quantity_list[i];
        }
    }

    const total = Number(moviePrice)  + Number(foodComboPrice);

    console.log(total);

    const sql = 'Insert into ticket (schedule_time_id, account_id, total) values (?,?,?)';
    const results = await db.queryTransaction(sql, [schedule_time_id, account_id, total]);
    const ticket_id = results.insertId;
    for (let i = 0; i < seatList.length; i++) {
        const sql = 'Insert into seat (ticket_id,schedule_time_id,name) values (?,?,?)';
        await db.queryTransaction(sql, [ticket_id,schedule_time_id, seatList[i]]);
    }
    if(food_combo_list.length > 0 && !!food_combo_list[0]){
        for (let i = 0; i < food_combo_list.length; i++) {
            const sql = 'Insert into food_combo_ticket (ticket_id,food_combo_id,quantity) values (?,?,?)';
            await db.queryTransaction(sql, [ticket_id, food_combo_list[i], food_combo_quantity_list[i]]);
        }
    }
    return ticket_id;
}

async function getTicketById(ticket_id){
    const sql = `SELECT
    t.account_id,
    a.email,
    th.id AS theatre_id,
    th.name AS theatre_name,
    r.name AS room_name,
    t.id AS ticket_id,
    t.schedule_time_id,
    t.account_id,
    t.createAt,
    st.start_time,
    st.end_time,
    CONVERT_TZ(sch.date, '-07:00', '+07:00') as date,
    sch.price,
    sch.movie_id,
    m.name AS movie_name,
    m.image AS movie_image,
    m.duration AS movie_duration,
    m.description AS movie_description,
    m.trailer AS movie_trailer,
    IFNULL(GROUP_CONCAT(DISTINCT s.name), '') AS seat_names,
    IFNULL(GROUP_CONCAT(DISTINCT f.id), '') AS food_combo_ids,
    IFNULL(GROUP_CONCAT(DISTINCT f.name), '') AS food_combo_names,
    IFNULL(GROUP_CONCAT(DISTINCT f.price), '') AS food_combo_prices,
    IFNULL(GROUP_CONCAT(DISTINCT f.image), '') AS food_combo_images,
    t.total
    FROM
        ticket t
    JOIN
        schedule_time st ON t.schedule_time_id = st.id
    JOIN
        schedule sch ON st.schedule_id = sch.id
    JOIN
        movie m ON sch.movie_id = m.id
    JOIN
        seat s ON t.id = s.ticket_id
    LEFT JOIN
        food_combo_ticket ft ON t.id = ft.ticket_id
    LEFT JOIN
        food_combo f ON ft.food_combo_id = f.id
    JOIN
        account a ON t.account_id = a.id
    JOIN
        theatre th ON sch.theatre_id = th.id
    JOIN
        room r ON sch.room_id = r.id
    WHERE
        t.id = ?
    GROUP BY t.id, st.start_time, st.end_time, sch.date, sch.price, sch.movie_id, m.name, m.image, m.duration, m.description, m.trailer
    ORDER BY t.createAt DESC;
    `;
    const results = await db.queryParams(sql, [ticket_id]);
    return results;
}

module.exports = TicketControllers;