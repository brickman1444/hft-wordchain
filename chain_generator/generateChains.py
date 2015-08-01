
import json
import copy

# constants

wordPairFileName = "wordPairs.json"
wordChainFileName = "wordLists.json"

chainLength = 6

def appendWordsToChain(partialChain, retList, shortList, pairDictionary):

	if partialChain is None:
		return

	lastWord = partialChain[-1]

	if lastWord not in pairDictionary:
		shortList.append(partialChain)
		return

	nextWords = pairDictionary[lastWord]

	for nextWord in nextWords:
		if nextWord in partialChain:
			shortList.append(partialChain)
			return
		else:
			newChain = copy.copy(partialChain)
			newChain.append(nextWord)
	
		if len(newChain) < chainLength:
			appendWordsToChain(newChain,retList,shortList,pairDictionary)
		else:
			retList.append( newChain )

def naiveMethod(pairDictionary):

	retList = []
	shortList = [] # to hold lists that are too short

	for firstWord in pairDictionary:

		chain = [firstWord]

		chain = appendWordsToChain(chain,retList,shortList,pairDictionary)

	print("Short List:")
	shortCount = 0
	for list in shortList:
		if len(list) == (chainLength - 1):
			print(list)
			shortCount += 1

	print("Just short count: %d" % shortCount)

	return retList

def getListsFromDictionary(pairDictionary):

	return naiveMethod(pairDictionary)

def getReverseDictionary(pairDictionary):

	retDict = {}

	# go through the whole list
	for firstWord, secondWords in pairDictionary.items():
		# for each second word
		for secondWord in secondWords:

			# only process a second word once
			if secondWord in retDict:
				continue
			
			retDict[secondWord] = []
			# go through the whole list again and collect all the first words for it
			for firstWord2, secondWords2 in pairDictionary.items():
				if secondWord in secondWords2:

					if firstWord2 not in retDict[secondWord]:
						#print("%s %s" % (secondWord, firstWord2))
						retDict[secondWord].append(firstWord2)

	return retDict

# main

file = open( wordPairFileName, 'r' )
pairRoot = json.load( file )

pairDictionary = pairRoot["word pairs"]
reverseDictionary = getReverseDictionary( pairDictionary )

lists = getListsFromDictionary( pairDictionary )

print("Generated %d lists" % len(lists))

listsRoot = {}
listsRoot["wordLists"] = lists

file = open(wordChainFileName, mode="w")
json.dump(listsRoot, file, indent="	")

file.close()