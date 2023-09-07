Create database cinema_management;
use cinema_management;

SET time_zone = '+07:00';

-- Create tables
CREATE TABLE account (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) DEFAULT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(255) DEFAULT NULL,
  address VARCHAR(255) DEFAULT NULL,
  birthday DATE DEFAULT NULL,
  password VARCHAR(255) NOT NULL,
  status INT NOT NULL DEFAULT 1,
  createAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  role VARCHAR(255) NOT NULL DEFAULT 'USER',
  PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE OTP (
  id INT NOT NULL AUTO_INCREMENT,
  account_id INT NOT NULL,
  code VARCHAR(255) NOT NULL,
  createAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (account_id) REFERENCES account(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE theatre (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(255) NOT NULL,
  image VARCHAR(255) NOT NULL,
  tel VARCHAR(255) NOT NULL,
  description VARCHAR(21844) DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE category (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE movie (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  duration INT NOT NULL,
  release_date DATE NOT NULL,
  image VARCHAR(255) NOT NULL,
  trailer VARCHAR(255) NOT NULL,
  status INT NOT NULL DEFAULT 1,
  description VARCHAR(21844) DEFAULT NULL,
  age_restrict VARCHAR(255) NOT NULL,
  director VARCHAR(255) NOT NULL,
  actors VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE movie_category (
  movie_id INT NOT NULL,
  category_id INT NOT NULL,
  FOREIGN KEY (movie_id) REFERENCES movie(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE room (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(255) NOT NULL,
  capacity INT NOT NULL DEFAULT 184,
  theatre_id INT NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (theatre_id) REFERENCES theatre(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE schedule (
  id INT NOT NULL AUTO_INCREMENT,
  movie_id INT NOT NULL,
  room_id INT NOT NULL,
  theatre_id INT NOT NULL,
  date DATE NOT NULL DEFAULT CURDATE(),
  price INT NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (movie_id) REFERENCES movie(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (theatre_id) REFERENCES theatre(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (room_id) REFERENCES room(id) ON DELETE CASCADE ON UPDATE CASCADE 
) ENGINE=InnoDB;

CREATE TABLE schedule_time(
  id INT NOT NULL AUTO_INCREMENT,
  schedule_id INT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (schedule_id) REFERENCES schedule(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE food_combo (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  popcorn INT NOT NULL,
  drink INT NOT NULL,
  price INT NOT NULL,
  description VARCHAR(21844) DEFAULT NULL,
  image VARCHAR(255) DEFAULT '/images/UI/popcorn&cola.jpg',
  PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE ticket (
  id INT NOT NULL AUTO_INCREMENT,
  account_id INT NOT NULL,
  schedule_time_id INT NOT NULL,
  createAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  total INT NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (account_id) REFERENCES account(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (schedule_time_id) REFERENCES schedule_time(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE food_combo_ticket (
  id INT NOT NULL AUTO_INCREMENT,
  food_combo_id INT NOT NULL,
  ticket_id INT NOT NULL,
  quantity INT NOT NULL,
  FOREIGN KEY (food_combo_id) REFERENCES food_combo(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (ticket_id) REFERENCES ticket(id) ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY (id)
) ENGINE=InnoDB;


CREATE TABLE seat (
  id INT NOT NULL AUTO_INCREMENT,
  ticket_id INT DEFAULT NULL,
  schedule_time_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (ticket_id) REFERENCES ticket(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (schedule_time_id) REFERENCES schedule_time(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE poster (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  image VARCHAR(255) NOT NULL,
  trailer VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

INSERT INTO poster(name,image,trailer) VALUES
('Babylon','/images/Carousel/Babylon.jpg','https://www.youtube.com/embed/5muQK7CuFtY'),
('Missing','/images/Carousel/Missing.jpg','https://www.youtube.com/embed/seBixtcx19E'),
('Titanic','/images/Carousel/Titanic.jpg','https://www.youtube.com/embed/kVrqfYjkTdQ');


-- Insert categories
INSERT INTO category (name) VALUES ('Action'), ('Comedy'), ('Drama'), ('Horror'), ('Fantasty'), ('Romance');

-- Insert current movies
INSERT INTO movie (name, duration, release_date, image, trailer, director, actors, age_restrict, description)
VALUES
  ('Aladdin', 120, '2019-05-22', '/images/Movie/aladdin.jpg', 'https://www.youtube.com/embed/foyufD52aog', 'Guy Ritchie', 'Mena Massoud, Naomi Scott, Will Smith, Marwan Kenzari', 'PG-7','A kind-hearted street urchin Aladdin vies for the love of the beautiful princess Jasmine, the princess of Agrabah. When he finds a magic lamp, he uses the genies magic power to make himself a prince in order to marry her. Hes also on a mission to stop the powerful Jafar who plots to steal the magic lamp that could make his deepest wishes come true'),
  ('Avengers: Endgame', 181, '2019-04-26', '/images/Movie/avenger-endgame.jpg', 'https://www.youtube.com/embed/TcMBFSGVi1c', 'Anthony Russo, Joe Russo', 'Robert Downey Jr., Chris Evans, Mark Ruffalo, Chris Hemsworth', 'PG-13','After the devastating events of Avengers: Infinity War (2018), the universe is in ruins due to the efforts of the Mad Titan, Thanos. With the help of remaining allies, the Avengers must assemble once more in order to undo Thanoss actions and undo the chaos to the universe, no matter what consequences may be in store, and no matter who they face...'),
  ('Captain Marvel', 124, '2019-03-08', '/images/Movie/captain-marvel.jpg', 'https://www.youtube.com/embed/Z1BCujX3pw8', 'Anna Boden, Ryan Fleck', 'Brie Larson, Samuel L. Jackson, Ben Mendelsohn, Jude Law', 'PG-13','After crashing an experimental aircraft, Air Force pilot Carol Danvers is discovered by the Kree and trained as a member of the elite Starforce Military under the command of her mentor Yon-Rogg. Six years later, after escaping to Earth while under attack by the Skrulls, Danvers begins to discover theres more to her past. With help from S.H.I.E.L.D. agent Nick Fury, they set out to unravel the truth.'),
  ('Cruella', 134, '2021-05-28', '/images/Movie/cruella.jpg', 'https://www.youtube.com/embed/gmRKv7n2If8', 'Craig Gillespie', 'Emma Stone, Emma Thompson, Joel Fry, Paul Walter Hauser', 'PG-13','Before she becomes Cruella de Vil, teenage Estella has a dream. She wishes to become a fashion designer, having been gifted with talent, innovation, and ambition all in equal measures. But life seems intent on making sure her dreams never come true. Having wound up penniless and orphaned in London at 12, 10 years later Estella runs wild through the city streets with her best friends and partners-in-(petty)-crime, Horace and Jasper, two amateur thieves. When a chance encounter vaults Estella into the world of the young rich and famous, however, she begins to question the existence shes built for herself in London and wonders whether she might, indeed, be destined for more after all.');
  -- ('No Time To Die', 134, '2021-09-30', '/images/Movie/no-time-to-die.jpg', 'https://www.youtube.com/embed/BIhNsAtPbPI', 'Cary Joji Fukunaga', 'Daniel Craig, Rami Malek, Léa Seydoux, Lashana Lynch', 'PG-13'),
  -- ('Spider-Man: Far From Home', 129, '2019-07-02', '/images/Movie/spider-man-far-from-home.jpg', 'https://www.youtube.com/embed/Nt9L1jCKGnE', 'Jon Watts', 'Tom Holland, Samuel L. Jackson, Zendaya, Jake Gyllenhaal', 'PG-13'),
  -- ('Star Wars: The Rise of Skywalker', 142, '2019-12-20', '/images/Movie/star-wars.jpg', 'https://www.youtube.com/embed/8Qn_spdM5Zg', 'J.J. Abrams', 'Daisy Ridley, Adam Driver, John Boyega, Oscar Isaac', 'PG-13'),
  -- ('Glass', 129, '2019-01-18', '/images/Movie/glass.jpg', 'https://www.youtube.com/embed/95ghQs5AmNk', 'M. Night Shyamalan', 'James McAvoy, Bruce Willis, Samuel L. Jackson, Anya Taylor-Joy', 'PG-13'),
  -- ('Thor', 130, '2017-11-03', '/images/Movie/thor.jpg', 'https://www.youtube.com/embed/JOddp-nlNvQ', 'Taika Waititi', 'Chris Hemsworth, Tom Hiddleston, Cate Blanchett, Mark Ruffalo', 'PG-13'),
  -- ('Toy Story 4', 100, '2019-06-21','/images/Movie/toy-story-4.jpg', 'https://www.youtube.com/embed/wmiIUN-7qhE', 'Josh Cooley', 'Tom Hanks, Tim Allen, Annie Potts, Tony Hale', 'G');

-- Insert upcoming movies
INSERT INTO movie (name, duration, release_date, image, trailer, status, actors, director, age_restrict, description)
VALUES
  ('Joker', 122, '2019-10-04', '/images/Movie/joker.jpg', 'https://www.youtube.com/embed/zAGVQLHvwOY', 0, 'Joaquin Phoenix, Robert De Niro, Zazie Beetz', 'Todd Phillips', 'R','A socially inept clown for hire - Arthur Fleck aspires to be a stand up comedian among his small job working dressed as a clown holding a sign for advertising. He takes care of his mother- Penny Fleck, and as he learns more about his mental illness, he learns more about his past. Dealing with all the negativity and bullying from society he heads downwards on a spiral, in turn showing how his alter ego "Joker", came to be.'),
  ('The Lion King', 118, '2019-07-19', '/images/Movie/lion-king.jpg', 'https://www.youtube.com/embed/7TavVZMewpY', 0, 'Donald Glover, Beyoncé, James Earl Jones', 'Jon Favreau', 'PG','In Africa, the lion cub Simba is the pride and joy of his parents King Mufasa and Queen Sarabi. Mufasa prepares Simba to be the next king of the jungle. However, the naive Simba believes in his envious uncle Scar that wants to kill Mufasa and Simba to become the next king. He lures Simba and his friend Nala to go to a forbidden place and they are attacked by hyenas but they are rescued by Mufasa. Then Scar plots another scheme to kill Mufasa and Simba but the cub escapes alive and leaves the kingdom believing he was responsible for the death of his father. Now Scar becomes the king supported by the evil hyenas while Simba grows in a distant land. Sometime later, Nala meets Simba and tells that the kingdom has become a creepy wasteland. What will Simba do?'),
  ('Frozen 2', 103, '2019-11-22', '/images/Movie/frozen-2.jpg', 'https://www.youtube.com/embed/Zi4LMpSDccc', 0, 'Kristen Bell, Idina Menzel, Josh Gad', 'Chris Buck, Jennifer Lee', 'PG','Having harnessed her ever-growing power after lifting the dreadful curse of the eternal winter in Nữ Hoàng Băng Giá (2013), the beautiful conjurer of snow and ice, Queen Elsa, now rules the peaceful kingdom of Arendelle, enjoying a happy life with her sister, Princess Anna. However, a melodious voice that only Elsa can hear keeps her awake, inviting her to the mystical enchanted forest that the sisters father told them about a long time ago. Now, unable to block the thrilling call of the secret siren, Elsa, along with Anna, Kristoff, Olaf, and Sven summons up the courage to follow the voice into the unknown, intent on finding answers in the perpetually misty realm in the woods. More and more, an inexplicable imbalance is hurting not only her kingdom but also the neighboring tribe of Northuldra. Can Queen Elsa put her legendary magical skills to good use to restore peace and stability?'),
  ('Jumanji: The Next Level', 123, '2019-12-13', '/images/Movie/jumanji-next-level.jpg', 'https://www.youtube.com/embed/F6QaLsw8EWY', 0, 'Dwayne Johnson, Kevin Hart, Jack Black', 'Jake Kasdan', 'PG-13','The gang is back but the game has changed. As they return to Jumanji to rescue one of their own, they discover that nothing is as they expect. The players will have to brave parts unknown and unexplored, from the arid deserts to the snowy mountains, in order to escape the worlds most dangerous game.');
  -- ('Black Widow', 134, '2021-07-09', '/images/Movie/black-widow.jpg', 'https://www.youtube.com/embed/Fp9pNPdNwjI', 0, 'Scarlett Johansson, Florence Pugh, David Harbour', 'Cate Shortland', 'PG-13'),
  -- ('Fast & Furious 9', 143, '2021-06-25', '/images/Movie/fast-furious-9.jpg', 'https://www.youtube.com/embed/FUK2kdPsBws', 0, 'Vin Diesel, Michelle Rodriguez, John Cena', 'Justin Lin', 'PG-13'),
  -- ('Godzilla vs. Kong', 113, '2021-03-31', '/images/Movie/godzilla-vs-kong.jpg', 'https://www.youtube.com/embed/odM92ap8_c0', 0, 'Alexander Skarsgård, Millie Bobby Brown, Rebecca Hall', 'Adam Wingard', 'PG-13'),
  -- ('The Suicide Squad', 132, '2021-08-06', '/images/Movie/suicide-squad.jpg', 'https://www.youtube.com/embed/eg5ciqQzmK0', 0, 'Margot Robbie, Idris Elba, John Cena', 'James Gunn', 'R');

-- Aladdin
INSERT INTO movie_category (movie_id, category_id) VALUES (1, 1), (1, 3), (1, 5);

-- Avengers: Endgame
INSERT INTO movie_category (movie_id, category_id) VALUES (2, 1), (2, 3), (2, 5);

-- Captain Marvel
INSERT INTO movie_category (movie_id, category_id) VALUES (3, 1), (3, 3), (3, 5);

-- Cruella
INSERT INTO movie_category (movie_id, category_id) VALUES (4, 3), (4, 5);

-- Joker
INSERT INTO movie_category (movie_id, category_id) VALUES (5, 3), (5, 4);

-- The Lion King
INSERT INTO movie_category (movie_id, category_id) VALUES (6, 2), (6, 3), (6, 5);

-- Frozen 2
INSERT INTO movie_category (movie_id, category_id) VALUES (7, 2), (7, 3), (7, 5);

-- Jumanji: The Next Level
INSERT INTO movie_category (movie_id, category_id) VALUES (7, 1), (7, 2), (7, 3), (7, 5);

INSERT INTO account(name,email,phone,password,status,role) VALUES ("admin","admin","1234567890","$2a$04$YYzITgz7yyA1sVxRwMjOZeMbNM0yu6qy5UXgKqegko27WuHuGAYu.",0,"ADMIN");
INSERT INTO account(name,email,phone,password,status,role) VALUES ("Nguyen Xuan Binh","binhnguyenxuan47@gmail.com","1234567890","$2a$04$D73d95wgjYUGotTLDSepcuIWo4dqv.dX0EQ5H99TfL0w8Xc6ypYEG",1,"USER");

INSERT INTO theatre(name, address, image, tel, description) VALUES
("Movie4U Gò Vấp", "Tầng 5 TTTM Vincom Plaza Gò Vấp, 12 Phan Văn Trị, Phường 7, Quận Gò Vấp", "/images/MovieTheatres/govap_cinema.jpg","0909090909","Trải nghiệm điện ảnh chất lượng nhất tại cụm rạp CGV trên toàn quốc. Trang thông tin tổng hợp lịch chiếu, trailers phim mới nhất."),
("Movie4U Bình Thạnh", "Tầng 5, Pearl Plaza, 561A Điện Biên Phủ, P.25, Q.Bình Thạnh, TP.HCM", "/images/MovieTheatres/binhthanh_cinema.png","0808080808","Trải nghiệm điện ảnh chất lượng nhất tại cụm rạp CGV trên toàn quốc. Trang thông tin tổng hợp lịch chiếu, trailers phim mới nhất.");

INSERT INTO room (name,type,theatre_id) 
VALUES
  ("Room 1","2D/3D",1),
  ("Room 2","2D/3D",1),
  ("Room 3","IMAX",1),
  ("Room 4","2D/3D",1),
  ("Room 1","2D/3D",2),
  ("Room 2","2D/3D",2),
  ("Room 3","4DX",2),
  ("Room 4","2D/3D",2);


-- Add sample schedules for Theatre 1
INSERT INTO schedule (movie_id, room_id, theatre_id, price)
VALUES
  (1, 1, 1, 10.00),
  (2, 2, 1, 12.50),
  (3, 3, 1, 11.00),
  (4, 4, 1, 9.00);

-- Add sample schedule times for Theatre 1
INSERT INTO schedule_time (schedule_id, start_time, end_time)
VALUES
  (1, '10:00:00', '12:30:00'),
  (1, '14:00:00', '16:30:00'),
  (1, '18:00:00', '20:30:00'),
  (2, '13:00:00', '15:30:00'),
  (3, '17:00:00', '19:30:00'),
  (4, '19:00:00', '21:30:00');

-- Add sample schedules for Theatre 2
INSERT INTO schedule (movie_id, room_id, theatre_id, price)
VALUES
  (1, 1, 2, 8.50),
  (2, 2, 2, 11.00),
  (3, 3, 2, 10.00),
  (4, 4, 2, 9.50);

-- Add sample schedule times for Theatre 2
INSERT INTO schedule_time (schedule_id, start_time, end_time)
VALUES
  (5, '12:00:00', '14:30:00'),
  (6, '16:00:00', '18:30:00'),
  (7, '18:45:00', '21:00:00'),
  (8, '20:30:00', '23:00:00');

INSERT INTO food_combo(name,price,popcorn,drink,description,image) VALUES 
("1 Popcorn And 2 Drink",10,1,2,'Include 1 popcorn + 2 drink','/images/FoodCombo/1p2d.jpg'),
("2 PopcornS And 3 Drink",20,2,3,'Include popcorn + 3 drink','/images/FoodCombo/1p2d.jpg'),
("3 PopcornS And 5 Drink",30,3,5,'Include popcorn + 5 drink','/images/FoodCombo/1p2d.jpg'),
("4 PopcornS And 7 Drink",50,4,7,'Include popcorn + 7 drink','/images/FoodCombo/1p2d.jpg');