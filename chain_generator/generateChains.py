
import json

def getListsFromDictionary(pairDictionary):

	retList = []

	for firstWord, secondWord in pairDictionary.items():
		retList.append( [firstWord,secondWord[0]] )

	return retList

# main

wordPairFileName = "wordPairs.json"
wordChainFileName = "wordLists.json"

file = open( wordPairFileName, 'r' )
pairRoot = json.load( file )

lists = getListsFromDictionary( pairRoot["word pairs"] )

listsRoot = {}
listsRoot["wordLists"] = lists

file = open(wordChainFileName, mode="w")
json.dump(listsRoot, file, indent="	")

file.close()