export const staticChores = [
  {
    title: 'Cat',
    id: 'cat',
    people: ['Kristopher'],
    isStatic: true,
    schedules: [
      {
        title: 'Daily',
        id: 'daily',
        tasks: [
          'Feed and water the cat in the morning',
          'Scoop out pee and poop in the evening'
        ]
      },
      {
        title: 'Saturday',
        id: 'saturday',
        tasks: [
          'Empty the litter box entirely',
          'Replace all litter',
          'Clean the mat in front of the litter box',
          'Clean the floor around the litter box'
        ]
      }
    ]
  },
  {
    title: 'Dogs-MWF',
    id: 'dogsmwf',
    people: ['Caroline'],
    isStatic: true,
    schedules: [
      {
        title: 'Monday / Wednesday / Friday',
        id: 'weekly',
        tasks: [
          'Feed and water the dogs in the morning',
          'Make sure the dogs have enough water throughout the day',
          'Let the dogs in and out both morning and afternoon',
          'Make sure the dogs are in at the end of the day',
          'Love the dogs'
        ]
      },
      {
        title: 'Sunday Morning',
        id: 'sunday',
        tasks: [
          'Feed and water the dogs in the morning',
          'Let the dogs out in the morning',
          'Love the dogs'
        ]
      }
    ]
  },
  {
    title: 'Dogs-TTS',
    id: 'dogstts',
    people: ['Phineas'],
    isStatic: true,
    schedules: [
      {
        title: 'Tuesday / Thursday / Saturday',
        id: 'weekly',
        tasks: [
          'Feed and water the dogs in the morning',
          'Make sure the dogs have enough water throughout the day',
          'Let the dogs in and out both morning and afternoon',
          'Make sure the dogs are in at the end of the day',
          'Love the dogs'
        ]
      },
      {
        title: 'Sunday Evening',
        id: 'sunday',
        tasks: [
          'Make sure the dogs have enough water throughout the day',
          'Let the dogs out in the afternoon',
          'Make sure the dogs are in at the end of the day',
          'Love the dogs'
        ]
      }
    ]
  }
]
