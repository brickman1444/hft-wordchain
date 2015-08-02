
import json
import copy
import pdb

# constants

wordPairFileName = "wordPairs.json"
wordChainFileName = "wordLists.json"

chainLength = 6

def appendWordsToChain(partialChain, retList, shortList, pairDictionary):

	lastWord = partialChain[-1]

	if lastWord not in pairDictionary:
		# end of the line
		shortList.append(partialChain)
		return

	nextWords = pairDictionary[lastWord]

	foundContinuation = False
	for nextWord in nextWords:
		if nextWord in partialChain:
			# repeat word
			# don't add to the shortList here because the lastWord has other nextWords to try
			# we don't know if it was a total dead end yet
			continue

		newChain = copy.copy(partialChain)
		newChain.append(nextWord)
	
		foundContinuation = True

		if len(newChain) < chainLength:
			appendWordsToChain(newChain,retList,shortList,pairDictionary)
		else:
			retList.append( newChain )

	if not foundContinuation:
		shortList.append(partialChain)

def naiveMethod(pairDictionary,reverseDictionary):

	retList = []
	shortList = [] # to hold lists that are too short

	for firstWord in pairDictionary:

		chain = [firstWord]

		chain = appendWordsToChain(chain,retList,shortList,pairDictionary)

	print("Short List:")
	shortCount = 0
	for list in shortList:
		if len(list) == (chainLength - 1) and list[0] not in reverseDictionary:
			print(list)
			shortCount += 1

	print("Just short count: %d" % shortCount)

	return retList

def getListsFromDictionary(pairDictionary,reverseDictionary):

	return naiveMethod(pairDictionary,reverseDictionary)

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

lists = getListsFromDictionary( pairDictionary, reverseDictionary )

print("Generated %d lists" % len(lists))

listsRoot = {}
listsRoot["wordLists"] = lists

file = open(wordChainFileName, mode="w")
json.dump(listsRoot, file, indent="	")

file.close()