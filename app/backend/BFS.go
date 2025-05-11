package main

import (
	"strconv"
	"strings"
	"sync"
)

func buildBFSRecipeTree(product string, idx map[string]Element, Nrecipe int, countRecipe *int, countMu *sync.Mutex) *RecipeNode {
	
	lower := strings.ToLower(product)
	root := &RecipeNode{
		Product:  product,
		ImageUrl1: "",
		Ingredients: [2]string{"", ""},
	}

	type item struct {
        node    *RecipeNode
        visited map[string]bool
    }

	
	visited := map[string]bool{lower: true}
	queue := []item{{node: root, visited: visited}}

	

	for len(queue) > 0 {
		// elemen pertama
		it := queue[0]

		// Slicing queue
        queue = queue[1:]
        curr, vis := it.node, it.visited

        lower := strings.ToLower(curr.Product)
        e, ok := idx[lower]
        if !ok {
            continue
        }

        prodTier, _ := strconv.Atoi(e.Tier)

		var (
			recWg sync.WaitGroup
			mu    sync.Mutex 
			queuemu sync.Mutex 
		)

		for _, rec := range e.Recipes {

			countMu.Lock()
			if (*countRecipe) >= Nrecipe {
				countMu.Unlock()
				return root
            }
			countMu.Unlock()

			ing1, ing2 := rec[0], rec[1]
			recVis := copyMap(vis)

			recWg.Add(1) 
			go func(ing1, ing2 string, recVis map[string]bool) {
			defer recWg.Done()
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

			if(tier1 >= prodTier){
				url1 = ""
			}

			if(tier2 >= prodTier){
				url2 = ""
			}

			combo := &RecipeNode{
                Ingredients: [2]string{ing1, ing2},
                Product:     curr.Product,
                ImageUrl1:   url1,
				ImageUrl2:   url2,
            }

			mu.Lock()
            curr.Children = append(curr.Children, combo)
			mu.Unlock()

			if(isBase(ing1) && isBase(ing2)) {
				countMu.Lock()
            	(*countRecipe)++
				countMu.Unlock()
			}

			var child []string

			if(tier1 < prodTier && !isBase(ing1)){
				child = append(child,ing1)
			}
			if(tier2 < prodTier && !isBase(ing2)){
				child = append(child,ing2)
			}

			for _, ing := range child {
                key := strings.ToLower(ing)
                // only enqueue jika belum visited di jalur ini
                if !recVis[key] {
                    newVis := copyMap(recVis)
                    newVis[key] = true

                    child := &RecipeNode{
                        Product:  ing,
                        ImageUrl1: "",
						Ingredients: [2]string{"", ""},
                    }
					queuemu.Lock()
                    combo.Children = append(combo.Children, child)
                    queue = append(queue, item{node: child, visited: newVis})
					queuemu.Unlock()
                }
            }
		}(ing1, ing2, recVis)
	} 
		recWg.Wait()
	}

	return root
}
