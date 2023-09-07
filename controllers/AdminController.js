const db = require('../database');
const multiparty = require('multiparty')
const fs = require('fs');
const path = require('path');
const helper = require('../helper');

const AdminControllers = {
    getAllUser: (req, res) => {
        $sql = 'SELECT * FROM account WHERE status = 1 ORDER BY createAt DESC';
        db.query($sql)
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

    deleteUser: (req, res) => {
        const id = req.query.id;
        if (!id) {
            res.status(200).json({
                code: 400,
                message: 'Bad request'
            });
            return;
        }
        $sql = 'DELETE FROM account WHERE id = ?';
        db.queryParams($sql, [id])
            .then((results) => {
                res.status(200).json({
                    code: 200,
                    message: 'Success'
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

    getAllMovie(req, res) {
        const sql = `SELECT * FROM movie`;
        db.query(sql)
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

    getAllTheatres: (req, res) => {
        const sql = `
                SELECT t.id AS id, t.name AS name, t.address AS address, t.image AS image, t.tel, t.description,
                COALESCE(SUM(CASE WHEN r.type = '2D/3D' THEN 1 ELSE 0 END), 0) AS 'R2D_3D',
                COALESCE(SUM(CASE WHEN r.type = '4DX' THEN 1 ELSE 0 END), 0) AS 'R4DX',
                COALESCE(SUM(CASE WHEN r.type = 'IMAX' THEN 1 ELSE 0 END), 0) AS 'RIMAX',
                GROUP_CONCAT(r.id) AS room_id, GROUP_CONCAT(r.name) AS room_name, GROUP_CONCAT(r.type) AS room_type
                FROM theatre t
                LEFT JOIN room r ON t.id = r.theatre_id
                GROUP BY t.id, t.name;
                `;
        db.query(sql)
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
    getTheatreById: (req, res) => {
        const theatre_id = req.query.theatre_id;

        if (!theatre_id) {
            res.status(200).json({
                code: 400,
                message: 'Bad request'
            });
            return;
        }

        $sql = `
                SELECT t.id AS theatre_id, t.name AS theatre_name, t.address AS theatre_address, t.image AS theatre_image, t.tel, t.description,
                COALESCE(SUM(CASE WHEN r.type = '2D/3D' THEN 1 ELSE 0 END), 0) AS 'R2D_3D',
                COALESCE(SUM(CASE WHEN r.type = '4DX' THEN 1 ELSE 0 END), 0) AS 'R4DX',
                COALESCE(SUM(CASE WHEN r.type = 'IMAX' THEN 1 ELSE 0 END), 0) AS 'RIMAX',
                GROUP_CONCAT(r.id) AS room_id, GROUP_CONCAT(r.name) AS room_name, GROUP_CONCAT(r.type) AS room_type
                FROM theatre t
                LEFT JOIN room r ON t.id = r.theatre_id
                WHERE t.id = ?
                GROUP BY t.id, t.name, t.address, t.image;
                `;
        db.queryParams($sql, [theatre_id])
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
    addTheatre(req, res) {
        const form = new multiparty.Form();
        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.log(err);
                res.status(500).json({
                    code: 500,
                    message: 'Internal server error'
                });
                return;
            }

            if(!fields.name || !fields.address || !fields.tel || !fields.description  || !fields.R2D_3D || !fields.R4DX || !fields.RIMAX || !files.image) {
                res.status(200).json({
                    code: 400,
                    message: 'Bad request'
                });
                return;
            }

            const name = fields.name[0];
            const address = fields.address[0];
            const tel = fields.tel[0];
            const description = fields.description[0];
            const roomList = [fields.R2D_3D[0], fields.R4DX[0], fields.RIMAX[0]];
            const roomListName = ['2D/3D', '4DX', 'IMAX'];
            const fileImage = files.image[0];

            if (!name || !address || !roomList || !fileImage || !tel || !description) {
                res.status(200).json({
                    code: 400,
                    message: 'Bad request'
                });
                return;
            }

            // validate image
            const errImage = validateImage(fileImage);
            if (errImage) {
                res.status(200).json({
                    code: 201,
                    message: errImage
                });
                return;
            }
            // move image to folder images/MovieTheatres
            const oldPath = fileImage.path;
            const destination = '/images/MovieTheatres/';
            const fileName = fileImage.originalFilename;
            const errMove = moveFile(oldPath, fileName, destination);
            if (errMove) {
                res.status(200).json({
                    code: 201,
                    message: errMove
                });
                return;
            }
            const sql = `INSERT INTO theatre(name, address, image, tel, description) VALUES(?, ?, ?, ?, ?)`;
            const params = [name, address, destination + fileImage.originalFilename, tel, description];
            db.queryTransaction(sql, params)
                .then(async (result) => {
                    const theatreId = result.insertId;
                    await addRoom(theatreId, roomList, roomListName)
                    res.status(200).json({
                        code: 200,
                        message: 'Success',
                        data: result
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({
                        code: 500,
                        message: 'Internal server error'
                    });
                });
        });
    },

    updateTheatre(req, res) {
        const form = new multiparty.Form();
        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.log(err);
                res.status(500).json({
                    code: 500,
                    message: 'Internal server error'
                });
                return;
            }

            if(!fields.id || !fields.name || !fields.address || !fields.tel || !fields.description) {
                res.status(200).json({
                    code: 400,
                    message: 'Bad request'
                });
                return;
            }

            const id = fields.id[0];
            const name = fields.name[0];
            const address = fields.address[0];
            const tel = fields.tel[0];
            const description = fields.description[0];

            if (!id || !name || !address || !tel || !description) {
                res.status(200).json({
                    code: 400,
                    message: 'Bad request'
                });
                return;
            }

            const theatre = await getTheatreById(id);

            if (theatre?.length === 0 || theatre === null) {
                res.status(200).json({
                    code: 201,
                    message: 'No Theatre found'
                });
                return;
            }

            let params = [];
            params = [name, address, theatre[0].image, tel, description, id];
            const sql = `UPDATE theatre SET name = ?, address = ?, image = ?, tel = ?, description = ? WHERE id = ?`;

            if (files?.image !== undefined) {
                const fileImage = files.image[0];

                await removeFile(theatre[0].image, 'theatre');

                // validata image
                const errImage = validateImage(fileImage);
                if (errImage) {
                    res.status(200).json({
                        code: 201,
                        message: errImage
                    });
                    return;
                }
                // move image to folder images/MovieTheatres
                const oldPath = fileImage.path;
                const destination = '/images/MovieTheatres/';
                const fileName = fileImage.originalFilename;
                const errMove = moveFile(oldPath, fileName, destination);
                params = [name, address, destination + fileImage.originalFilename, tel, description , id];

                if (errMove) {
                    res.status(200).json({
                        code: 201,
                        message: errMove
                    });
                    return;
                }
            }

            db.queryTransaction(sql, params)
                .then((result) => {
                    res.status(200).json({
                        code: 200,
                        message: 'Success',
                        data: result
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({
                        code: 500,
                        message: 'Internal server error'
                    });
                });
        });
    },
    async deleteTheatre(req, res) {
        const id = req.query.id;

        if (!id) {
            res.status(200).json({
                code: 400,
                message: 'Bad request'
            });
            return;
        }

        const theatre = await getTheatreById(id);

        console.log(theatre);

        if (theatre === null || theatre?.length === 0) {
            res.status(200).json({
                code: 201,
                message: 'Theatre not exist'
            });
            return;
        }

        removeFile(theatre[0].image, 'theatre');

        const sql = `DELETE FROM theatre WHERE id = ?`;
        const params = [id];
        await db.queryTransaction(sql, params)
            .then((result) => {
                res.status(200).json({
                    code: 200,
                    message: 'Success',
                    data: result
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
    getRevenue: async (req, res) => {
        let sql = `SELECT SUM(total) as total FROM ticket`;
        let revenue = 0;
        await db.query(sql)
            .then((result) => {
                if(result[0].total !== null){
                    revenue = result[0].total;
                }
            });
        sql = `SELECT COUNT(*) as total FROM ticket`;
        let totalTicket = 0;
        await db.query(sql)
            .then((result) => {
                totalTicket = result[0].total;
            }
            );
        let toltalView = 0;
        sql = `SELECT COUNT(*) as total FROM seat`;
        await db.query(sql)
            .then((result) => {
                toltalView = result[0].total;
            });

        res.status(200).json({
            code: 200,
            message: 'Success',
            data: {
                revenue: revenue,
                totalTicket: totalTicket,
                toltalView: toltalView
            }
        });
    },
    addScheduleMovie: async (req, res) => {
        let { movie_id, theatre_id, room_id, date, start_time, end_time, price } = req.body;
        if (!movie_id || !theatre_id || !room_id || !date || !start_time || !end_time || !price) {
            res.status(200).json({
                code: 400,
                message: 'Bad request'
            });
            return;
        }

        if(date < new Date().toISOString().split('T')[0]) {
            res.status(200).json({
                code: 201,
                message: 'Date is not available'
            });
            return;
        }

        start_time = helper.convertTime(start_time);
        end_time = helper.convertTime(end_time);

        if(start_time >= end_time) {
            res.status(200).json({
                code: 201,
                message: 'End time must be greater than start time'
            });
            return;
        }

        const movie = await getMovieById(movie_id);
        if (movie === null || movie?.length === 0) {
            res.status(200).json({
                code: 201,
                message: 'Movie not exist'
            });
            return;
        }else{
            const duration = movie[0].duration;
            const date1 = new Date(0, 0, 0, start_time.split(':')[0], start_time.split(':')[1], 0);
            const date2 = new Date(0, 0, 0, end_time.split(':')[0], end_time.split(':')[1], 0);
            if(date2 < date1) {
                res.status(200).json({
                    code: 201,
                    message: 'End time must be greater than start time'
                });
                return;
            }
            
            if(duration > (date2 - date1) / 1000 / 60) {
                res.status(200).json({
                    code: 201,
                    message: 'Time duration is not enough'
                });
                return;
            }
        }

        let checkSchedule = await checkScheduleTime(start_time, end_time, date, room_id);

        if (checkSchedule !== null) {
            res.status(200).json({
                code: 201,
                message: 'There is a schedule in this time'
            });
            return;
        }

        checkSchedule = await checkScheduleExist(movie_id, theatre_id, room_id, date);

        if (checkSchedule !== null) {
            const schedule_id = checkSchedule[0].id;
            const sql = `INSERT INTO schedule_time (schedule_id, start_time, end_time) VALUES (?, ?, ?)`;
            const params = [schedule_id, start_time, end_time];
            await db.queryTransaction(sql, params)
                .then((result) => {
                    res.status(200).json({
                        code: 200,
                        message: 'Add schedule successfully',
                        data: result
                    });
                    return;
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({
                        code: 500,
                        message: 'Internal server error'
                    });
                    return;
                });
        } else {
            const sql = `INSERT INTO schedule (movie_id, theatre_id, room_id, date, price) VALUES (?, ?, ?, ?, ?)`;
            const params = [movie_id, theatre_id, room_id, date, price];

            db.queryTransaction(sql, params)
                .then(async (result) => {
                    const schedule_id = result.insertId;
                    const sql = `INSERT INTO schedule_time (schedule_id, start_time, end_time) VALUES (?, ?, ?)`;
                    const params = [schedule_id, start_time, end_time];
                    await db.queryTransaction(sql, params)
                        .then((result) => {
                            res.status(200).json({
                                code: 200,
                                message: 'Add schedule successfully',
                                data: result
                            });
                        })
                        .catch((err) => {
                            console.log(err);
                            res.status(500).json({
                                code: 500,
                                message: 'Internal server error'
                            });
                        });
                })
        }

    },

    getAllSchedule: async (req, res) => {
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
        LEFT JOIN 
            theatre th ON sch.theatre_id = th.id
        LEFT JOIN 
            room r ON sch.room_id = r.id
        LEFT JOIN 
            schedule_time st ON sch.id = st.schedule_id
        JOIN 
            movie m ON sch.movie_id = m.id
        GROUP BY sch.id, th.name, th.address, th.image, r.name, r.type, r.capacity
        ORDER BY date desc;
        `;
        db.query(sql)
            .then((result) => {
                res.status(200).json({
                    code: 200,
                    message: 'Success',
                    data: result
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

    getFoodComboById: async (req, res) => {
        const id = req.query.id;
        const sql = `SELECT * FROM food_combo WHERE id = ?`;
        const params = [id];
        db.queryParams(sql, params)
            .then((result) => {
                res.status(200).json({
                    code: 200,
                    message: 'Success',
                    data: result
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

    addFoodCombo: async (req, res) => {
        //form
        const form = new multiparty.Form();
        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.log(err);
                res.status(500).json({
                    code: 500,
                    message: 'Internal server error'
                });
                return;
            }

            if(!fields.name || !fields.price || !fields.description || !files.image || !fields.popcorn || !fields.drink) {
                res.status(200).json({
                    code: 400,
                    message: 'Bad request'
                });
                return;
            }

            const name = fields.name[0];
            const price = fields.price[0];
            const description = fields.description[0];
            const popcorn = fields.popcorn[0];
            const drink = fields.drink[0];
            const imageFile = files.image[0];

            if (!name || !price || !description || !imageFile || !popcorn || !drink) {
                res.status(200).json({
                    code: 400,
                    message: 'Bad request'
                });
                return;
            }

            const check = await validateImage(imageFile);
            if (check !== null) {
                res.status(200).json({
                    code: 201,
                    message: check
                });
                return;
            }

            const fileName = imageFile.originalFilename;
            const filePath = `/images/FoodCombo/${fileName}`;
            const oldPath = imageFile.path;

            moveFile(oldPath, fileName, 'images/FoodCombo');

            const sql = `INSERT INTO food_combo (name, price, description, image, popcorn, drink) VALUES (?, ?, ?, ?, ?, ?)`;
            const params = [name, price, description, filePath, popcorn, drink];

            db.queryTransaction(sql, params)
                .then((result) => {
                    res.status(200).json({
                        code: 200,
                        message: 'Add food combo successfully',
                        data: result
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({
                        code: 500,
                        message: 'Internal server error'
                    });
                });
        });
    },

    updateFoodCombo: async (req, res) => {
        const form = new multiparty.Form();
        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.log(err);
                res.status(500).json({
                    code: 500,
                    message: 'Internal server error'
                });
                return;
            }

            if(!fields.id || !fields.name || !fields.price || !fields.description || !fields.popcorn || !fields.drink) {
                res.status(200).json({
                    code: 400,
                    message: 'Bad request'
                });
                return;
            }

            const id = fields.id[0];
            const name = fields.name[0];
            const price = fields.price[0];
            const description = fields.description[0];
            const popcorn = fields.popcorn[0];
            const drink = fields.drink[0];


            if (!id || !name || !price || !description || !popcorn || !drink) {
                res.status(200).json({
                    code: 400,
                    message: 'Bad request'
                });
                return;
            }

            const food_combo = await getFoodComboById(id);

            if (food_combo.length === 0) {
                res.status(200).json({
                    code: 201,
                    message: 'Food combo not found'
                });
                return;
            }

            let params = [name, price, description, food_combo[0].image, popcorn, drink, id];
            const sql = `UPDATE food_combo SET name = ?, price = ?, description = ?, image = ?, popcorn = ?, drink = ? WHERE id = ?`;
            if (files?.image !== undefined) {
                const imageFile = files.image[0];
                const check = await validateImage(imageFile);
                if (check !== null) {
                    res.status(200).json({
                        code: 201,
                        message: check
                    });
                    return;
                }
                const fileName = `${imageFile.originalFilename}`;
                const filePath = `/images/FoodCombo/${fileName}`;
                const oldPath = imageFile.path;
                moveFile(oldPath, fileName, 'images/FoodCombo');
                removeFile(food_combo[0].image, 'food_combo');
                params = [name, price, description, filePath, popcorn, drink, id];
                db.queryParams(sql, params)
                    .then((result) => {
                        res.status(200).json({
                            code: 200,
                            message: 'Update food combo successfully',
                            data: result
                        });
                    })
                    .catch((err) => {
                        console.log(err);
                        res.status(500).json({
                            code: 500,
                            message: 'Internal server error'
                        });
                    });
            } else {
                db.queryParams(sql, params)
                    .then((result) => {
                        res.status(200).json({
                            code: 200,
                            message: 'Update food combo successfully',
                            data: result
                        });
                    })
                    .catch((err) => {
                        console.log(err);
                        res.status(500).json({
                            code: 500,
                            message: 'Internal server error'
                        });
                    });
            }
        });
    },

    deleteFoodCombo: async (req, res) => {
        const id = req.query.id;

        if (!id) {
            res.status(200).json({
                code: 400,
                message: 'Bad request'
            });
            return;
        }

        const food_combo = await getFoodComboById(id);

        if (food_combo?.length === 0 || food_combo === null) {
            res.status(200).json({
                code: 400,
                message: 'Food combo not found'
            });
            return;
        }

        const sql = `DELETE FROM food_combo WHERE id = ?`;
        const params = [id];

        db.queryTransaction(sql, params)
            .then((result) => {
                removeFile(food_combo[0].image, 'food_combo');
                res.status(200).json({
                    code: 200,
                    message: 'Delete food combo successfully',
                    data: result
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

    addMovie: async (req, res) => {
        const form = new multiparty.Form();
        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.log(err);
                res.status(500).json({
                    code: 500,
                    message: 'Internal server error'
                });
                return;
            }

            if(!fields.name || !fields.description || !fields.duration || !fields.releaseDate || !fields.director || !fields.actors || !fields.trailer || !fields.status || !fields.category_id || !fields.age_restrict) {
                res.status(200).json({
                    code: 400,
                    message: 'Bad request'
                });
                return;
            }

            const name = fields.name[0];
            const description = fields.description[0];
            const duration = fields.duration[0];
            const releaseDate = fields.releaseDate[0];
            const director = fields.director[0];
            const actors = fields.actors[0];
            const trailer = fields.trailer[0];
            const imageFile = files.image[0];
            const status = fields.status[0];
            const category_id = fields.category_id[0];
            const age_restrict = fields.age_restrict[0];

            if (!name || !description || !duration || !releaseDate || !director || !actors || !trailer || !imageFile || !status || !category_id || !age_restrict ) {
                res.status(200).json({
                    code: 400,
                    message: 'Bad request'
                });
                return;
            }

            const categoryList = category_id.split(',');

            const check = await validateImage(imageFile);
            if (check !== null) {
                res.status(200).json({
                    code: 400,
                    message: check
                });
                return;
            }
            
            const fileName = `${imageFile.originalFilename}`;
            const filePath = `/images/Movie/${fileName}`;
            const oldPath = imageFile.path;
            moveFile(oldPath, fileName, 'images/Movie');

            const sql = `INSERT INTO movie (name, description, duration, release_date, director, actors, trailer, image, status, age_restrict) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const params = [name, description, duration, releaseDate, director, actors, trailer, filePath, status, age_restrict];

            db.queryTransaction(sql, params)
                .then(async (result) => {
                    const insertId = result.insertId;
                    await addCategoryForMovie(insertId, categoryList);
                    res.status(200).json({
                        code: 200,
                        message: 'Add movie successfully',
                        data: result
                    });

                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({
                        code: 500,
                        message: 'Internal server error'
                    });
                });
        });
    },

    updateMovie: async (req, res) => {
        const form = new multiparty.Form();
        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.log(err);
                res.status(500).json({
                    code: 500,
                    message: 'Internal server error'
                });
                return;
            }

            if(!fields.id || !fields.name || !fields.description || !fields.duration || !fields.releaseDate || !fields.director || !fields.actors || !fields.trailer || !fields.status || !fields.category_id || !fields.age_restrict) {
                res.status(200).json({
                    code: 400,
                    message: 'Bad request'
                });
                return;
            }

            const id = fields.id[0];
            const name = fields.name[0];
            const description = fields.description[0];
            const duration = fields.duration[0];
            const releaseDate = fields.releaseDate[0];
            const director = fields.director[0];
            const actors = fields.actors[0];
            const trailer = fields.trailer[0];
            const status = fields.status[0];
            const category_id = fields.category_id[0];
            const age_restrict = fields.age_restrict[0];

            if (!id || !name || !description || !duration || !releaseDate || !director || !actors || !trailer || !status || !category_id || !age_restrict) {
                res.status(200).json({
                    code: 400,
                    message: 'Bad request'
                });
                return;
            }

            const categoryList = category_id.split(',');

            const movie = await getMovieById(id);

            if (movie?.length === 0 || movie === null) {
                res.status(200).json({
                    code: 400,
                    message: 'Movie not found'
                });
                return;
            }
            if (files?.image !== undefined) {
                console.log('image');
                const imageFile = files.image[0];
                const check = await validateImage(imageFile);
                if (check !== null) {
                    res.status(200).json({
                        code: 201,
                        message: check
                    });
                    return;
                }
                const fileName = `${imageFile.originalFilename}`;
                const filePath = `/images/Movie/${fileName}`;
                const oldPath = imageFile.path;
                moveFile(oldPath, fileName, 'images/Movie');
                removeFile(movie[0].image, 'movie');
                const sql = `UPDATE movie SET name = ?, description = ?, duration = ?, release_date = ?, director = ?, actors = ?, trailer = ?, image = ?, status = ?, age_restrict = ? WHERE id = ?`;
                params = [name, description, duration, releaseDate, director, actors, trailer, filePath, status, age_restrict, id];
                db.queryParams(sql, params)
                    .then(async (result) => {
                        await updateCategoryForMovie(id, categoryList);
                        res.status(200).json({
                            code: 200,
                            message: 'Update movie successfully',
                            data: result
                        });
                    })
                    .catch((err) => {
                        console.log(err);
                        res.status(500).json({
                            code: 500,
                            message: 'Internal server error'
                        });
                    });
            } else {
                const sql = `UPDATE movie SET name = ?, description = ?, duration = ?, release_date = ?, director = ?, actors = ?, trailer = ?, status = ?, age_restrict = ? WHERE id = ?`;
                params = [name, description, duration, releaseDate, director, actors, trailer, status, age_restrict, id];
                db.queryParams(sql, params)
                    .then(async (result) => {
                        await updateCategoryForMovie(id, categoryList);
                        res.status(200).json({
                            code: 200,
                            message: 'Update movie successfully',
                            data: result
                        });
                    })
                    .catch((err) => {
                        console.log(err);
                        res.status(500).json({
                            code: 500,
                            message: 'Internal server error'
                        });
                    });
            }
        });
    },

    deleteMovie: async (req, res) => {
        const id = req.query.id;
        if (!id) {
            res.status(200).json({
                code: 400,
                message: 'Bad request'
            });
            return;
        }

        const movie = await getMovieById(id);
        if (movie?.length === 0 || movie === null) {
            res.status(200).json({
                code: 400,
                message: 'Movie not found'
            });
            return;
        }

        const sql = `DELETE FROM movie WHERE id = ?`;
        const params = [id];
        db.queryParams(sql, params)
            .then((result) => {
                removeFile(movie[0].image, 'movie');
                res.status(200).json({
                    code: 200,
                    message: 'Delete movie successfully',
                    data: result
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

}

function moveFile(oldPath, fileName, destination) {
    const newPath = path.join(__dirname, `/../public` + `/${destination}/${fileName}`);
    fs.copyFileSync(oldPath, newPath)
    return null;
}

function removeFile(filePath, table = "") {
    const oldPath = path.join(__dirname, `/../public` + `${filePath}`);

    if (table !== "") {
        const sql = `SELECT * FROM ${table} WHERE image = ?`;
        const params = [filePath];
        db.queryParams(sql, params)
            .then((result) => {
                if (result.length > 1) {
                    if(fs.existsSync(oldPath)) {
                        fs.unlinkSync(oldPath);
                    }
                }
            })
            .catch((err) => {
                console.log(err);
            });
        return null;
    }
}

function validateImage(fileImage) {
    if (fileImage.size > 5000000) {
        return 'Image is too large';
    }
    let regex = /\.(gif|jpe?g|tiff?|png|webp|bmp)$/i
    if (!regex.test(fileImage.originalFilename)) {
        return 'Image is not valid';
    }
    return null;
}

async function getTheatreById(id) {
    const sql = `SELECT * FROM theatre WHERE id = ?`;
    const params = [id];
    const result = await db.queryParams(sql, params);
    if (result.length === 0) {
        return null;
    }
    return result;
}

async function addRoom(theatre_id, roomList, roomListName) {
    let insertQueries = [];
    let count = 0;
    for (let i = 0; i < roomList.length; i++) {
        for (let j = 0; j < roomList[i]; j++) {
            insertQueries.push({
                sql: 'INSERT INTO room (theatre_id,type, name) VALUES (?,?,?)',
                values: [theatre_id, roomListName[i], `Room ${count}`]
            });
            count++;
        }
    }

    insertQueries.forEach((query) => {
        db.queryTransaction(query.sql, query.values);
    });
}

async function checkScheduleTime(start_time, end_time, date, room_id) {
    // schedulue"_time store start_time and end_time and have a foreign key shedule_id have date and room_id, check it to make sure that during the start to end time have no schedule is not exist
    const sql = `
    SELECT *
    FROM schedule_time
    WHERE (
        (start_time <= ? AND end_time >= ?) OR
        (start_time < ? + INTERVAL 1 HOUR AND end_time > ? + INTERVAL 1 HOUR) OR
        (start_time < ? - INTERVAL 1 HOUR AND end_time > ? - INTERVAL 1 HOUR) OR
        (start_time < ? AND end_time > ?)
    )
    AND schedule_id IN (SELECT id FROM schedule WHERE date = ? AND room_id = ?)
    `;

    const params = [start_time, end_time, start_time, end_time, start_time, end_time, start_time, start_time, date, room_id];

    const result = await db.queryParams(sql, params);

    if (result.length > 0) {
        return result;
    }

    return null;
}

async function checkScheduleExist(movie_id, theatre_id, room_id, date) {
    const sql = `SELECT * FROM schedule WHERE movie_id = ? AND theatre_id = ? AND room_id = ? AND date = ?`;
    const params = [movie_id, theatre_id, room_id, date];
    const result = await db.queryParams(sql, params);
    if (result.length > 0) {
        return result;
    }
    return null;
}

async function getFoodComboById(id) {
    const sql = `SELECT * FROM food_combo WHERE id = ?`;
    const params = [id];
    const result = await db.queryParams(sql, params);
    if (result.length === 0) {
        return null;
    }
    return result;
}

async function addCategoryForMovie(movie_id, categoryList) {
    let insertQueries = [];
    for (let i = 0; i < categoryList.length; i++) {
        insertQueries.push({
            sql: 'INSERT INTO movie_category (movie_id, category_id) VALUES (?,?)',
            values: [movie_id, categoryList[i]]
        });
    }

    insertQueries.forEach((query) => {
        db.queryTransaction(query.sql, query.values);
    });
}

async function updateCategoryForMovie(movie_id, categoryList) {
    const sql = `DELETE FROM movie_category WHERE movie_id = ?`;
    const params = [movie_id];
    await db.queryTransaction(sql, params);

    await addCategoryForMovie(movie_id, categoryList);
}

async function getMovieById(id) {
    const sql = `SELECT * FROM movie WHERE id = ?`;
    const params = [id];
    const result = await db.queryParams(sql, params);
    if (result.length === 0) {
        return null;
    }
    return result;
}

module.exports = AdminControllers;