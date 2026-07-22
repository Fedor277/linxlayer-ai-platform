# Pin this value to the exact version validated for the selected GPU and model.
ARG VLLM_IMAGE=vllm/vllm-openai:v0.20.0
FROM ${VLLM_IMAGE}

COPY start-vllm.sh /usr/local/bin/start-vllm.sh
RUN chmod 0555 /usr/local/bin/start-vllm.sh

ENTRYPOINT ["/usr/local/bin/start-vllm.sh"]
