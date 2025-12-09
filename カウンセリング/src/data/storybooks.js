/**
 * 絵本データ
 * 子供が感情移入しやすいストーリー
 * キャラクターを通して間接的に気持ちを引き出す
 */

// 絵本のテーマ（子供が選ぶ）
export const storyThemes = [
    {
        id: 'lonely-rabbit',
        emoji: '🐰',
        title: 'ひとりぼっちのうさぎ',
        description: 'みんなと遊べない日',
        color: '#E8D5F2',
        emotion: 'lonely'
    },
    {
        id: 'angry-bear',
        emoji: '🐻',
        title: 'おこったくまさん',
        description: 'イライラしちゃう日',
        color: '#FFDDD2',
        emotion: 'angry'
    },
    {
        id: 'scared-cat',
        emoji: '🐱',
        title: 'こわがりねこちゃん',
        description: '不安でドキドキする日',
        color: '#D4E5FF',
        emotion: 'anxious'
    },
    {
        id: 'sad-penguin',
        emoji: '🐧',
        title: 'かなしいペンギン',
        description: '泣きたくなる日',
        color: '#D5F2E8',
        emotion: 'sad'
    },
    {
        id: 'tired-dog',
        emoji: '🐶',
        title: 'つかれたわんこ',
        description: 'もう何もしたくない日',
        color: '#FFF2D5',
        emotion: 'tired'
    },
    {
        id: 'confused-fox',
        emoji: '🦊',
        title: 'まよったきつねさん',
        description: 'どうしていいかわからない日',
        color: '#FFE8D5',
        emotion: 'confused'
    }
];

// サンプル絵本（ひとりぼっちのうさぎ）
export const sampleStories = {
    'lonely-rabbit': {
        title: 'ひとりぼっちのうさぎ',
        character: 'うさぎのミミ',
        pages: [
            {
                id: 1,
                text: 'うさぎのミミは、今日も教室の隅っこにいました。',
                imagePrompt: 'A cute white rabbit sitting alone in the corner of a classroom, looking lonely, soft pastel illustration style, children book art',
                backgroundColor: '#F5F0FF'
            },
            {
                id: 2,
                text: 'みんなは楽しそうに話しています。\nでも、ミミは輪に入れません。',
                imagePrompt: 'A lonely white rabbit watching other animal friends talking together from a distance, soft watercolor style',
                backgroundColor: '#EDE8FF'
            },
            {
                id: 3,
                text: '「どうして私だけ...」\nミミの胸がキュッとなりました。',
                imagePrompt: 'A sad white rabbit holding its chest, tears forming in eyes, gentle children book illustration',
                backgroundColor: '#E5E0FF'
            },
            {
                id: 4,
                text: 'そのとき、小さなねずみさんが\nそっと近づいてきました。',
                imagePrompt: 'A small kind mouse approaching a lonely white rabbit, warm and gentle illustration',
                backgroundColor: '#E8E5FF'
            },
            {
                id: 5,
                text: '「一人でいるの、つらいよね。\n私もそういう日があるよ」',
                imagePrompt: 'A mouse and rabbit sitting together, the mouse speaking kindly, soft pastel colors',
                backgroundColor: '#F0EDFF'
            }
        ],
        questions: [
            {
                id: 'feeling',
                text: 'ミミは今、どんな気持ちかな？',
                options: [
                    { id: 'sad', emoji: '😢', label: 'かなしい' },
                    { id: 'lonely', emoji: '🥺', label: 'さみしい' },
                    { id: 'anxious', emoji: '😰', label: 'ふあん' },
                    { id: 'angry', emoji: '😤', label: 'くやしい' }
                ]
            },
            {
                id: 'relate',
                text: 'あなたも、こういう気持ちになることある？',
                options: [
                    { id: 'often', emoji: '😢', label: 'よくある' },
                    { id: 'sometimes', emoji: '😐', label: 'たまに' },
                    { id: 'rarely', emoji: '🙂', label: 'あんまり' },
                    { id: 'never', emoji: '😊', label: 'ない' }
                ]
            },
            {
                id: 'wish',
                text: 'ミミに何か言ってあげるとしたら？',
                options: [
                    { id: 'notalone', emoji: '💙', label: '一人じゃないよ' },
                    { id: 'ok', emoji: '🌟', label: '大丈夫だよ' },
                    { id: 'understand', emoji: '🤝', label: 'わかるよ' },
                    { id: 'together', emoji: '🐰', label: '一緒にいるよ' }
                ]
            }
        ],
        endMessage: 'ミミのこと、考えてくれてありがとう。\nあなたの気持ちも、大切だよ。💙'
    },
    'angry-bear': {
        title: 'おこったくまさん',
        character: 'くまのポン',
        pages: [
            {
                id: 1,
                text: 'くまのポンは、今日とってもイライラしていました。',
                imagePrompt: 'A grumpy brown bear with crossed arms looking frustrated, cute children book style, soft colors',
                backgroundColor: '#FFF5F0'
            },
            {
                id: 2,
                text: '朝から何もかもうまくいきません。\n「もう！」って声が出ちゃいます。',
                imagePrompt: 'A frustrated bear with steam coming from ears, dropping things, children book illustration',
                backgroundColor: '#FFEDE8'
            },
            {
                id: 3,
                text: 'お友達に、つい強い言葉を言ってしまいました。\n本当はそんなつもりじゃなかったのに。',
                imagePrompt: 'A bear looking regretful after saying something mean to a friend rabbit, soft watercolor',
                backgroundColor: '#FFE5E0'
            },
            {
                id: 4,
                text: '一人になって、ポンは思いました。\n「どうして自分をコントロールできないんだろう...」',
                imagePrompt: 'A lonely bear sitting on a rock, looking sad and reflective, gentle pastel illustration',
                backgroundColor: '#FFE8E5'
            },
            {
                id: 5,
                text: 'でも、イライラする気持ちがあるのは\n自然なことなんだよ。',
                imagePrompt: 'A wise owl comforting a bear, warm and reassuring atmosphere, children book art',
                backgroundColor: '#FFF0ED'
            }
        ],
        questions: [
            {
                id: 'feeling',
                text: 'ポンは今、どんな気持ちかな？',
                options: [
                    { id: 'angry', emoji: '😤', label: 'イライラ' },
                    { id: 'regret', emoji: '😔', label: 'こうかい' },
                    { id: 'sad', emoji: '😢', label: 'かなしい' },
                    { id: 'confused', emoji: '😕', label: 'もやもや' }
                ]
            },
            {
                id: 'relate',
                text: 'あなたも、イライラしちゃうことある？',
                options: [
                    { id: 'often', emoji: '😤', label: 'よくある' },
                    { id: 'sometimes', emoji: '😐', label: 'たまに' },
                    { id: 'rarely', emoji: '🙂', label: 'あんまり' },
                    { id: 'never', emoji: '😊', label: 'ない' }
                ]
            },
            {
                id: 'wish',
                text: 'ポンに何か言ってあげるとしたら？',
                options: [
                    { id: 'ok', emoji: '💙', label: '誰でもあるよ' },
                    { id: 'rest', emoji: '🛋️', label: '休んでいいよ' },
                    { id: 'understand', emoji: '🤝', label: 'わかるよ' },
                    { id: 'brave', emoji: '🌟', label: 'がんばってるね' }
                ]
            }
        ],
        endMessage: 'ポンのこと、考えてくれてありがとう。\n怒りの気持ちがあってもいいんだよ。💙'
    },
    'scared-cat': {
        title: 'こわがりねこちゃん',
        character: 'ねこのモモ',
        pages: [
            {
                id: 1,
                text: 'ねこのモモは、とっても心配性です。',
                imagePrompt: 'A small cute cat looking worried and nervous, big eyes, soft pastel children book style',
                backgroundColor: '#F0F5FF'
            },
            {
                id: 2,
                text: '「明日のこと、どうなるかな...」\n夜になると、不安で眠れません。',
                imagePrompt: 'A cat lying in bed at night, unable to sleep, looking at the ceiling worried, gentle illustration',
                backgroundColor: '#E8F0FF'
            },
            {
                id: 3,
                text: '考えれば考えるほど、\nドキドキが止まりません。',
                imagePrompt: 'A cat with visible heartbeat lines around chest, looking anxious, soft watercolor style',
                backgroundColor: '#E0E8FF'
            },
            {
                id: 4,
                text: 'そんなとき、お母さんねこが\nそっと抱きしめてくれました。',
                imagePrompt: 'A mother cat hugging a small worried cat gently, warm and comforting scene',
                backgroundColor: '#E5EDFF'
            },
            {
                id: 5,
                text: '「不安な気持ちがあっても大丈夫。\nモモはモモのままでいいんだよ」',
                imagePrompt: 'Mother cat and baby cat together, peaceful and reassuring, soft pastel colors',
                backgroundColor: '#F0F5FF'
            }
        ],
        questions: [
            {
                id: 'feeling',
                text: 'モモは今、どんな気持ちかな？',
                options: [
                    { id: 'anxious', emoji: '😰', label: 'ふあん' },
                    { id: 'scared', emoji: '😨', label: 'こわい' },
                    { id: 'worried', emoji: '😟', label: 'しんぱい' },
                    { id: 'safe', emoji: '😌', label: 'あんしん' }
                ]
            },
            {
                id: 'relate',
                text: 'あなたも、心配になることある？',
                options: [
                    { id: 'often', emoji: '😰', label: 'よくある' },
                    { id: 'sometimes', emoji: '😐', label: 'たまに' },
                    { id: 'rarely', emoji: '🙂', label: 'あんまり' },
                    { id: 'never', emoji: '😊', label: 'ない' }
                ]
            },
            {
                id: 'wish',
                text: 'モモに何か言ってあげるとしたら？',
                options: [
                    { id: 'ok', emoji: '💙', label: '大丈夫だよ' },
                    { id: 'notalone', emoji: '🤝', label: '一人じゃないよ' },
                    { id: 'strong', emoji: '🌟', label: '強いね' },
                    { id: 'same', emoji: '🐱', label: '私もだよ' }
                ]
            }
        ],
        endMessage: 'モモのこと、考えてくれてありがとう。\n心配になるのは、やさしい証拠だよ。💙'
    },
    'sad-penguin': {
        title: 'かなしいペンギン',
        character: 'ペンギンのペン',
        pages: [
            {
                id: 1,
                text: 'ペンギンのペンは、今日とても悲しい気持ちです。',
                imagePrompt: 'A sad little penguin looking down, tear in eye, soft pastel children book illustration',
                backgroundColor: '#E8FFF5'
            },
            {
                id: 2,
                text: '何が悲しいのか、自分でもよくわかりません。\nただ、胸がぎゅっとするのです。',
                imagePrompt: 'A penguin holding its chest, confused and sad expression, gentle watercolor style',
                backgroundColor: '#E0FFF0'
            },
            {
                id: 3,
                text: '笑っているみんなを見ると、\nもっと悲しくなってしまいます。',
                imagePrompt: 'A sad penguin watching happy friends from afar, melancholic but gentle scene',
                backgroundColor: '#D8FFE8'
            },
            {
                id: 4,
                text: 'ペンは静かな場所で、\nしばらく一人でいることにしました。',
                imagePrompt: 'A penguin sitting alone by the sea, peaceful but sad, soft blue and green tones',
                backgroundColor: '#E0FFED'
            },
            {
                id: 5,
                text: '泣きたいときは、泣いていいんだよ。\n悲しい気持ちも、大切な気持ちだから。',
                imagePrompt: 'A penguin being comforted by soft falling snow, peaceful and accepting atmosphere',
                backgroundColor: '#E8FFF5'
            }
        ],
        questions: [
            {
                id: 'feeling',
                text: 'ペンは今、どんな気持ちかな？',
                options: [
                    { id: 'sad', emoji: '😢', label: 'かなしい' },
                    { id: 'lonely', emoji: '🥺', label: 'さみしい' },
                    { id: 'empty', emoji: '😶', label: 'からっぽ' },
                    { id: 'tired', emoji: '😔', label: 'つかれた' }
                ]
            },
            {
                id: 'relate',
                text: 'あなたも、悲しくなることある？',
                options: [
                    { id: 'often', emoji: '😢', label: 'よくある' },
                    { id: 'sometimes', emoji: '😐', label: 'たまに' },
                    { id: 'rarely', emoji: '🙂', label: 'あんまり' },
                    { id: 'never', emoji: '😊', label: 'ない' }
                ]
            },
            {
                id: 'wish',
                text: 'ペンに何か言ってあげるとしたら？',
                options: [
                    { id: 'cry', emoji: '💧', label: '泣いていいよ' },
                    { id: 'together', emoji: '🤝', label: 'そばにいるよ' },
                    { id: 'ok', emoji: '💙', label: '大丈夫だよ' },
                    { id: 'understand', emoji: '🐧', label: 'わかるよ' }
                ]
            }
        ],
        endMessage: 'ペンのこと、考えてくれてありがとう。\n悲しいときは、ゆっくりでいいんだよ。💙'
    },
    'tired-dog': {
        title: 'つかれたわんこ',
        character: 'いぬのワン',
        pages: [
            {
                id: 1,
                text: 'いぬのワンは、もうヘトヘトです。',
                imagePrompt: 'A very tired cute dog lying flat, exhausted expression, soft children book style',
                backgroundColor: '#FFFBF0'
            },
            {
                id: 2,
                text: '何もしたくない。\n起き上がるのも大変です。',
                imagePrompt: 'A tired dog unable to get up, lazy and heavy body, gentle pastel illustration',
                backgroundColor: '#FFF8E8'
            },
            {
                id: 3,
                text: '「がんばらなきゃ」と思うけど、\n体が動きません。',
                imagePrompt: 'A dog trying to get up but falling back down, struggling expression, soft watercolor',
                backgroundColor: '#FFF5E0'
            },
            {
                id: 4,
                text: 'そんなワンに、友達のねこが言いました。\n「休んでもいいんだよ」',
                imagePrompt: 'A kind cat talking to tired dog, offering comfort, warm gentle illustration',
                backgroundColor: '#FFF8E5'
            },
            {
                id: 5,
                text: '毎日がんばっているワンには、\n休む時間も必要なんだ。',
                imagePrompt: 'A dog peacefully resting with a blanket, content and relaxed, soft pastel colors',
                backgroundColor: '#FFFBF0'
            }
        ],
        questions: [
            {
                id: 'feeling',
                text: 'ワンは今、どんな気持ちかな？',
                options: [
                    { id: 'tired', emoji: '😴', label: 'つかれた' },
                    { id: 'heavy', emoji: '😩', label: 'だるい' },
                    { id: 'empty', emoji: '😶', label: 'やる気ない' },
                    { id: 'relieved', emoji: '😌', label: 'ほっとした' }
                ]
            },
            {
                id: 'relate',
                text: 'あなたも、疲れてること、ある？',
                options: [
                    { id: 'often', emoji: '😴', label: 'よくある' },
                    { id: 'sometimes', emoji: '😐', label: 'たまに' },
                    { id: 'rarely', emoji: '🙂', label: 'あんまり' },
                    { id: 'never', emoji: '😊', label: 'ない' }
                ]
            },
            {
                id: 'wish',
                text: 'ワンに何か言ってあげるとしたら？',
                options: [
                    { id: 'rest', emoji: '🛋️', label: '休んでいいよ' },
                    { id: 'enough', emoji: '🌟', label: 'がんばってるよ' },
                    { id: 'ok', emoji: '💙', label: '無理しないで' },
                    { id: 'same', emoji: '🐶', label: '私もだよ' }
                ]
            }
        ],
        endMessage: 'ワンのこと、考えてくれてありがとう。\n休むことも、大切なことだよ。💙'
    },
    'confused-fox': {
        title: 'まよったきつねさん',
        character: 'きつねのコン',
        pages: [
            {
                id: 1,
                text: 'きつねのコンは、頭の中がグルグルです。',
                imagePrompt: 'A confused fox with swirling thoughts above head, cute children book style',
                backgroundColor: '#FFF5E8'
            },
            {
                id: 2,
                text: '何をすればいいのか、わかりません。\n考えても考えても、答えが出ません。',
                imagePrompt: 'A fox sitting with many question marks around, puzzled expression, soft illustration',
                backgroundColor: '#FFEDE0'
            },
            {
                id: 3,
                text: 'みんながスラスラ進んでいくのを見ると、\n「自分だけ取り残されてる」と感じます。',
                imagePrompt: 'A fox watching others move forward while standing still, melancholic scene',
                backgroundColor: '#FFE5D8'
            },
            {
                id: 4,
                text: 'でも、立ち止まって考えることは、\n悪いことじゃないんだよ。',
                imagePrompt: 'A wise owl reassuring a confused fox, gentle and warm atmosphere',
                backgroundColor: '#FFE8E0'
            },
            {
                id: 5,
                text: '迷うことは、真剣に向き合っている証拠。\nゆっくりでいいんだ。',
                imagePrompt: 'A fox looking at a peaceful sunset, calm and hopeful, soft pastel colors',
                backgroundColor: '#FFF5E8'
            }
        ],
        questions: [
            {
                id: 'feeling',
                text: 'コンは今、どんな気持ちかな？',
                options: [
                    { id: 'confused', emoji: '😕', label: 'もやもや' },
                    { id: 'anxious', emoji: '😰', label: 'ふあん' },
                    { id: 'frustrated', emoji: '😤', label: 'イライラ' },
                    { id: 'hopeful', emoji: '🙂', label: 'すこし安心' }
                ]
            },
            {
                id: 'relate',
                text: 'あなたも、迷うこと、ある？',
                options: [
                    { id: 'often', emoji: '😕', label: 'よくある' },
                    { id: 'sometimes', emoji: '😐', label: 'たまに' },
                    { id: 'rarely', emoji: '🙂', label: 'あんまり' },
                    { id: 'never', emoji: '😊', label: 'ない' }
                ]
            },
            {
                id: 'wish',
                text: 'コンに何か言ってあげるとしたら？',
                options: [
                    { id: 'ok', emoji: '💙', label: '迷っていいよ' },
                    { id: 'slow', emoji: '🐢', label: 'ゆっくりでいいよ' },
                    { id: 'together', emoji: '🤝', label: '一緒に考えよう' },
                    { id: 'same', emoji: '🦊', label: '私もだよ' }
                ]
            }
        ],
        endMessage: 'コンのこと、考えてくれてありがとう。\n迷っても、あなたはあなただよ。💙'
    }
};

// ヘルパー関数
export function getStoryByTheme(themeId) {
    return sampleStories[themeId] || null;
}

export function getThemeById(themeId) {
    return storyThemes.find(t => t.id === themeId) || null;
}
