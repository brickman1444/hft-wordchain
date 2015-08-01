
import json

def appendWordToChain(partialChain, pairDictionary):

	if partialChain is None:
		return None

	lastWord = partialChain[-1]

	if lastWord in pairDictionary:
		nextWord = pairDictionary[lastWord][0]
	else:
		print("end of chain")
		return None

	if nextWord in lastWord:
		print("Found loop")
		return None
	else:
		partialChain.append(nextWord)
		return partialChain


def naiveMethod(pairDictionary):

	retList = []

	for firstWord, secondWordList in pairDictionary.items():

		chain = [firstWord,secondWordList[0]]

		chain = appendWordToChain(chain,pairDictionary)
		chain = appendWordToChain(chain,pairDictionary)
		chain = appendWordToChain(chain,pairDictionary)
		chain = appendWordToChain(chain,pairDictionary)

		if chain is not None:
			retList.append( chain )

	return retList

def getListsFromDictionary(pairDictionary):

	return naiveMethod(pairDictionary)

# main

wordPairFileName = "wordPairs.json"
wordChainFileName = "wordLists.json"

file = open( wordPairFileName, 'r' )
pairRoot = json.load( file )

lists = getListsFromDictionary( pairRoot["word pairs"] )

print("Generated %d lists" % len(lists))

listsRoot = {}
listsRoot["wordLists"] = lists

file = open(wordChainFileName, mode="w")
json.dump(listsRoot, file, indent="	")

file.close()