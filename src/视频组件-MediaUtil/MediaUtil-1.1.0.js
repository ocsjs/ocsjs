MediaUtils(doc,medias, setting,callback) {
                    $(medias).each(function(i,e){
                        let media = e
                        try {
                            let sinter = setInterval(() => {
                                media.muted = setting.muted; //静音
                                media.playbackRate = setting.playbackRate; //静音
                            }, 1000);
                            media.play()
                            //强制播放
                            media.addEventListener('pause', function () {
                                if (!media.ended) media.play()
                            })
                            media.addEventListener('error', function () {
                                console.log('error')
                                if (callback != undefined) callback(false)//this.jobError(doc)

                            })
                            media.addEventListener('ended', function () {
                                clearInterval(sinter)
                                console.log('ended')
                                console.log(setting)
                                if (callback != undefined) callback(true)//this.jobFinish(doc)
                            })
                        } catch (e) {
                            console.log(e)
                        }
                    })

                }
