package main

import (
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	// Configure CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://127.0.0.1:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Content-Length", "Accept-Encoding", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// API routes - define these before static file handlers
	api := r.Group("/api")
	{
		api.GET("/hello", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"message": "はいいいいい!!"})
		})
		api.GET("/jovkon", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"message": "ルビーちゃん、何が好き？!"})
		})
	}

	// Serve frontend static files
	r.Static("/static", "./frontend/static")
	r.Static("/assets", "./frontend/assets")

	// Serve index.html for all other routes (SPA routing)
	r.NoRoute(func(c *gin.Context) {
		c.File("./frontend/index.html")
	})

	r.Run(":8081")
}
