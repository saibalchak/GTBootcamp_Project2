CREATE TABLE "emission_data" (
	id SERIAL PRIMARY KEY,
	state VARCHAR(100),
	year VARCHAR,
	emission_value FLOAT
);

CREATE TABLE "temperature_data" (
	id SERIAL PRIMARY KEY,
	station VARCHAR(100),
	year VARCHAR,
	latitude FLOAT,
	longitude FLOAT,
	tavg FLOAT 
);