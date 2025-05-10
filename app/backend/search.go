package main

import (
	"log"
	"strconv"
)
func search(target string, traversal string, isMulti string, num string) []Entry {
	numInt, err := strconv.Atoi(num)
	if err != nil {
		log.Printf("Error converting num to int: %v", err)
		return nil
	}
	isMultiBool, err := strconv.ParseBool(isMulti)
	if err != nil {
		log.Printf("Error converting isMulti to bool: %v", err)
		return nil
	}
	if isMultiBool {
		// Handle multi search logic here
		log.Printf("Performing multi search for target: %s, traversal: %s, numSearch: %d",target, traversal,numInt)
	} else {
		// Handle single search logic here
		log.Printf("Performing single search for target: %s, traversal: %s", target, traversal,)
	}
	result := getEntries()
	for _, entry := range result {
		if entry.Element == target {
			return []Entry{
				{entry.Category, entry.Element, entry.Recipes, entry.ImageUrl},
			}
		}
	}
	log.Printf("No entries found for target: %s", target)
	return nil
}