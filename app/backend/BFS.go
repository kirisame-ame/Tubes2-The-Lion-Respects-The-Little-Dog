package main

import (
	"log"
	"strconv"
	"strings"
	"sync"
)

type item struct {
	node    *RecipeNode
	visited map[string]bool
	rootId  int 
	direction string
}

type recipeStatus struct {
	Ing1Found bool
	Ing2Found bool
}

func checkLeafNum(recipeStatuses map[int]*recipeStatus) int {
	leafNum := 0 
	for _, status := range recipeStatuses {
		if status.Ing1Found && status.Ing2Found {
			leafNum++
		}
	}
	return leafNum
}

func isLeafPath(ingredient string, idx map[string]Element, prodTier int, initialVisited map[string]bool) bool {
	ingLower := strings.ToLower(ingredient)
	
	if isBase(ingLower) {
        return true
    }
	if initialVisited[ingLower] {
		return false
	}
	
	visited := copyMap(initialVisited)
	visited[ingLower] = true
	
	
	ingElement, exists := idx[ingLower]
	if !exists {
		return false
	}
	
	
	ingTier, _ := strconv.Atoi(ingElement.Tier)
	if ingTier >= prodTier {
		return false 
	}
	
	
	for _, recipe := range ingElement.Recipes {
		subIng1 := recipe[0]
		subIng2 := recipe[1]
		if isLeafPath(subIng1, idx, prodTier, visited) && isLeafPath(subIng2, idx, prodTier, visited) {
            return true
        }
	}
	
	return false 
}

func buildBFSRecipeTree(product string, idx map[string]Element, Nrecipe int, countRecipe *int, countMu *sync.Mutex) *RecipeNode {
	var (
        queueMu   sync.Mutex
        statusMu  sync.Mutex
        stopMu    sync.Mutex
        recWg     sync.WaitGroup
    )
	
	var depth int = 0
	var shouldStop bool = false
	var indexRoot int = 0
	lower := strings.ToLower(product)
	root := &RecipeNode{
		Product:    product,
		ImageUrl1:  idx[lower].ImageUrl,
		Ingredients: [2]string{"", ""},
	}

	
	recipeStatuses := make(map[int]*recipeStatus)
	
	visited := map[string]bool{lower: true}
	queue := []item{{node: root, visited: visited, rootId : -1, direction: ""}}

	for len(queue) > 0 {

		stopMu.Lock()
        if shouldStop {
            stopMu.Unlock()
            break
        }
        stopMu.Unlock()

		queueMu.Lock()
        if len(queue) == 0 {
            queueMu.Unlock()
            break
        }
        it := queue[0]
        queue = queue[1:]
        queueMu.Unlock()


		curr, vis, rootId, dir := it.node, it.visited, it.rootId, it.direction

		lower := strings.ToLower(curr.Product)
		e, ok := idx[lower]
		if !ok {
			continue
		}

		prodTier, _ := strconv.Atoi(e.Tier)
		
		for _, rec := range e.Recipes {
			// init recipe status
			var myIndex int
			if(depth == 0){
				myIndex = indexRoot
				statusMu.Lock()
                recipeStatuses[myIndex] = &recipeStatus{false,false}
                statusMu.Unlock()
				indexRoot++
			} else {
				myIndex = rootId
			}

			myDepth := depth

			recVis := copyMap(vis)

			recWg.Add(1)
			go func(curr *RecipeNode, recVis map[string]bool, myIndex, myDepth int, dir string, recipeStatuses map[int]*recipeStatus) {
				defer recWg.Done()
				LR := 0 
				appended := false
				ing1, ing2 := rec[0], rec[1]
				
				// ambil url dan tier 
				url1 := idx[strings.ToLower(ing1)].ImageUrl
				url2 := idx[strings.ToLower(ing2)].ImageUrl
				tier1, err1 := strconv.Atoi(idx[strings.ToLower(ing1)].Tier)
				tier2, err2 := strconv.Atoi(idx[strings.ToLower(ing2)].Tier)

				if err1 != nil {
					tier1 = 0
					url1 = getBaseUrl(ing1)
				}
				if err2 != nil {
					tier2 = 0
					url2 = getBaseUrl(ing2)
				}

				if tier1 >= prodTier {
					url1 = ""
				}
				if tier2 >= prodTier {
					url2 = ""
				}

				combo := &RecipeNode{
					Ingredients: [2]string{ing1, ing2},
					Product:     curr.Product,
					ImageUrl1:   url1,
					ImageUrl2:   url2,
				}

				
				vis1 := copyMap(recVis)
				vis2 := copyMap(recVis)
				
				// check apakah rute mengandung solusi
				ing1HasLeafPath := isLeafPath(ing1, idx, prodTier,vis1)
				ing2HasLeafPath := isLeafPath(ing2, idx, prodTier,vis2)
				log.Println("check leaf path", ing1, ing2, "rootId : ", myIndex, " Product ", curr.Product, " ing1HasLeafPath", ing1HasLeafPath, " ing2HasLeafPath", ing2HasLeafPath)
				
				if ing1HasLeafPath && ing2HasLeafPath {
					statusMu.Lock()   
                    curr.Children = append(curr.Children, combo)
					appended = true
                    statusMu.Unlock()
				}

				// check BaseElement
				statusMu.Lock()
				if (isBase(ing1) && isBase(ing2) && myDepth == 0){
					log.Println(ing1, ing2, "rootId : ", myIndex, " Product ", curr.Product)
					recipeStatuses[myIndex].Ing1Found = true 
					recipeStatuses[myIndex].Ing2Found = true
					
				} else if (isBase(ing1) && isBase(ing2) && myDepth > 0 ){
					if(dir == "left"){
						recipeStatuses[myIndex].Ing1Found = true
					} else {
						recipeStatuses[myIndex].Ing2Found = true
					}
				}
				statusMu.Unlock()

				countMu.Lock()
				if(checkLeafNum(recipeStatuses) >= Nrecipe){
					// Tandai bahwa loop utama harus berhenti
					shouldStop = true
					countMu.Unlock()
					return
				}
				countMu.Unlock()

				var child []string

				if tier1 < prodTier && !isBase(ing1) {
					child = append(child, ing1)
				}
				if tier2 < prodTier && !isBase(ing2) {
					child = append(child, ing2)
				}

				// append child
				log.Println(appended)
				if(appended){
				for _, ing := range child {
					key := strings.ToLower(ing)
					
					if !recVis[key] {
						newVis := copyMap(recVis)
						newVis[key] = true

						child := &RecipeNode{
							Product:     ing,
							ImageUrl1:   "",
							Ingredients: [2]string{"", ""},
						}
						
						queueMu.Lock()
						combo.Children = append(combo.Children, child)

						// jika root, direction kita yang tentukan
						if(myDepth == 0){
							
							if (LR == 0 ){
								dir =   "left"
							} else {
								dir =  "right"
							}
							log.Println("rootId : ", myIndex, " Product ", child.Product, " direction ", dir)
							queue = append(queue, item{node: child, visited: newVis, rootId: myIndex, direction : dir })
						} else {
							log.Println(" depth > 0 | rootId : ", myIndex, " Product ", child.Product, " direction ", dir)
						queue = append(queue, item{node: child, visited: newVis, rootId: myIndex , direction : dir})
						}
						queueMu.Unlock()
					}
					
					LR++
					
				}}

				log.Println("depth", myDepth)
				
			}(curr, recVis, myIndex, myDepth, dir, recipeStatuses)
			
		}

		depth++
		recWg.Wait()
	}

	return root
}
