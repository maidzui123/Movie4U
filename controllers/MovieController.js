const db = require('../database');
const MovieControllers = {
    getAllMovie: (req, res) => {
        const status = req.query.status;

        const sql = `SELECT movie.id, movie.name, movie.duration, movie.release_date, movie.image, movie.trailer, movie.director, movie.actors, movie.age_restrict, movie.description, GROUP_CONCAT(category.id) as category_id ,GROUP_CONCAT(category.name) AS categories, movie.status
                    FROM movie
                    INNER JOIN movie_category ON movie.id = movie_category.movie_id
                    INNER JOIN category ON movie_category.category_id = category.id
                    WHERE movie.status = ?
                    GROUP BY movie.id
                    Order by movie.release_date DESC`;
        db.queryParams(sql, [status])
            .then((results) => {
                res.status(200).json(
                    {
                        code: 200,
                        message: 'Success',
                        data: results
                    }
                );
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json({
                    code: 500,
                    message: 'Internal server error' });
            });
    },
    getMovieById: (req, res) => {
        const id = req.query.id;

        if(!id){
            res.status(400).json({
                code: 400,
                message: 'Bad request'
            });
            return;
        }
        const sql = `SELECT movie.id, movie.name, movie.duration, movie.release_date, movie.image, movie.trailer, movie.director, movie.actors, movie.age_restrict, movie.description, GROUP_CONCAT(category.id) as category_id ,GROUP_CONCAT(category.name) AS categories, movie.status
                    FROM movie
                    INNER JOIN movie_category ON movie.id = movie_category.movie_id
                    INNER JOIN category ON movie_category.category_id = category.id
                    WHERE movie.id = ?
                    GROUP BY movie.id`;
        db.queryParams(sql, [id])
            .then((results) => {
                res.status(200).json({
                    code: 200,
                    message: 'Success',
                    data: results
                });
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json({ message: 'Internal server error' });
            });
    },
    getMovieByName: (req, res) => {
        let name = req.query.name;
        name = name.toLowerCase();
        const sql = `SELECT movie.id, movie.name, movie.duration, movie.release_date, movie.image, movie.trailer, GROUP_CONCAT(category.name) AS categories, movie.status
                    FROM movie
                    INNER JOIN movie_category ON movie.id = movie_category.movie_id
                    INNER JOIN category ON movie_category.category_id = category.id
                    WHERE LOWER(movie.name) LIKE ?
                    GROUP BY movie.id`;
        db.queryParams(sql, [`%${name}%`])
            .then((results) => {
                res.status(200).json({
                    code: 200,
                    message: 'Success',
                    data: results
                });
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json({ message: 'Internal server error' });
            });
    },
    getAllPoster: (req, res) => {
        const sql = `SELECT * FROM poster`;
        db.query(sql)
            .then((results) => {
                res.status(200).json({
                    code: 200,
                    message: 'Success',
                    data: results
                });
            }
            )
            .catch((err) => {
                console.log(err);
                res.status(500).json({
                    code: 500,
                    message: 'Internal server error' });
            }
            );
    },

}
module.exports = MovieControllers;
