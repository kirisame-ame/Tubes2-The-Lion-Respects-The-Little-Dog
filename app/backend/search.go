package main

import (
	"log"
	"strconv"
	"sync"
)
func search(target string, traversal string, isMulti string, num string) []byte{
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

	entries, err := loadEntries("data/elements.json")
	if err != nil {
        log.Fatalf("Gagal load entries: %v", err)
    }
	idx := buildIndex(entries)


	if(traversal == "BFS") {
		rootname := target
		var countMu sync.Mutex
		var Nrecipe int
		countRecipe := 0
		if(!isMultiBool) {
			Nrecipe = 1
		} else {
			Nrecipe = numInt
		}

		tree := buildBFSRecipeTree(rootname, idx , Nrecipe, &countRecipe, &countMu)
		treeResult := getSolutionTree(tree, 0)
		b, err := ExportTreeAsJSON(treeResult)
		if err != nil {
			log.Printf("Error exporting tree to JSON: %v", err)
			return nil
		}
		log.Printf("%s",b)
		return b

	} else {

		rootname := target
		var countMu sync.Mutex
		var Nrecipe int
		countRecipe := 0
		visited := make(map[string]bool)
		if(!isMultiBool) {
			Nrecipe = 1
		} else {
			Nrecipe = numInt
		}

		tree,_ := buildRecipeTree(rootname, idx, visited, Nrecipe, &countRecipe, &countMu, 0)
		treeResult := getSolutionTree(tree, 0)
		b, err := ExportTreeAsJSON(treeResult)
		if err != nil {
			log.Printf("Error exporting tree to JSON: %v", err)
			return nil
		}

		log.Printf("%s",b)
		return b 
	}
}