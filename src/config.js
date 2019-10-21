import dotenv from 'dotenv';
dotenv.config();  // assign process.env from .env file

export default {
	"port": 8080,
	"bodyLimit": "100kb",
	"corsHeaders": ["Link"],
	"nativePlatform": "storyforest",
};
