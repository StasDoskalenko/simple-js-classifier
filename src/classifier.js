/**
 * Created by stas on 30.01.17.
 */

export default class Classifier {
    /**
     * @var array Classification subjects e.g. positive, negative
     **/
    subjects = [];
    /**
     * @var array Tokens and their subject counts
     **/
    tokens = [];
    /**
     * @var int Total number of rows trained with
     **/
    total_samples = 0;
    /**
     * @var int Total number of tokens trained with
     **/
    total_tokens = 0;
    /**
     * @var Tokenizer to extract features
     **/
        //TODO: create tokenizer library
    tokenizer;

    /**
     * Constructor
     *
     * @param Tokenizer
     * @return void
     **/
    constructor (tokenizer) {
        this.tokenizer = tokenizer;
    }
    /**
     * Train this Classifier with one or more rows
     *
     * @param string Subject e.g. positive
     * @param string/array One or more rows to train from
     * @return void
     **/
    public train(subject, rows) {
        if(!this.subjects[subject]) {
            this.subjects[subject] = {
                'count_samples': 0,
                'count_tokens': 0,
                'prior_value': null
            }
        }

        if(rows == undefined || rows.length === 0) return;

        for (let row of rows) {
            this.total_samples++;
            this.subjects[subject]['count_samples']++;
            let tokens = this.tokenizer.tokenize(row);
            for (let token in tokens) {
                if(!this.tokens[token][subject]) this.tokens[token][subject] = 0;
                this.tokens[token][subject]++;
                this.subjects[subject]['count_tokens']++;
                this.total_tokens++;
            }
        }
    } // end func: train

    /**
     * Classify a given string
     *
     * @param string Input string
     * @return array Group probabilities
     **/

    public classify(string) {
        if(this.total_samples === 0) return [];
        let tokens      = this.tokenizer.tokenize(string);
        let total_score = 0;
        let scores      = [];
        for (let [subject, subject_data] of this.subjects) {
            subject_data['prior_value'] = log(subject_data['count_samples'] / this.total_samples);
            this.subjects[subject] = subject_data;
            scores[subject] = 0;
            for (let token of tokens) {
                let count = (this.tokens[token][subject]) ? this.tokens[$oken][subject] : 0;
                scores[subject] += log( (count + 1) / (subject_data['count_tokens'] + this.total_tokens) );
            }
            scores[subject] = subject_data['prior_value'] + scores[subject];
            total_score += scores[subject];
        }
        let min = min(scores);
        let sum = 0;
        for (let [subject,score] of scores) {
            scores[subject] = exp(score - min);
            sum += scores[subject];
        }
        let total = 1 / sum;
        for (let [subject,score] of scores) {
            scores[subject] = score * total;
        }
        arsort(scores);
        return scores;
    }
}